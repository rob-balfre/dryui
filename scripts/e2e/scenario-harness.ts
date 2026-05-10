/**
 * Runs one E2E scenario: scaffold a fresh DryUI project from the current
 * worktree, exercise the feedback UE, let Codex make changes, then verify
 * the result builds and serves the expected content.
 *
 * Each scenario claims its own ports and temp project dir so multiple can run
 * in parallel (subject to Codex subscription concurrency).
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { Buffer } from 'node:buffer';
import {
	closeSync,
	copyFileSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	openSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync
} from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { waitForUrl } from '../../packages/feedback-server/src/cli/launch-dashboard.ts';
import {
	runAgentExec,
	summarizeCodexRun,
	type AgentBackend,
	type CodexRunResult
} from './codex-runner.ts';
import { scaffoldDryuiConsumerProject } from './scaffold-adapter.ts';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..', '..');
const defaultTarballsDir = resolve(repoRoot, 'reports/e2e-tarballs');

// A 1×1 transparent PNG + WebP. These are the smallest valid images the feedback
// server will accept for a synthetic POST /submissions. We don't care about the
// pixels — the submission's job is to prove the UE pipeline round-trips a real
// HTTP request through the store and out to MCP pollers.
const BLANK_PNG_BASE64 =
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const BLANK_WEBP_BASE64 = 'UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
const FEEDBACK_FETCH_TIMEOUT_MS = 10_000;
const CODEX_HEARTBEAT_MS = 30_000;
const CODEX_STDIN_NOTICE = 'Reading additional input from stdin...';

export interface ScenarioDefinition {
	readonly name: string;
	readonly prompt: string;
	readonly assets?: readonly ScenarioImageAsset[];
	readonly assertions: readonly ScenarioAssertion[];
	readonly codexTimeoutMs?: number;
	readonly codexModel?: string;
}

export interface ScenarioImageAsset {
	readonly label: string;
	readonly sourcePath: string;
	readonly targetPath: string;
	readonly purpose: string;
}

export type ScenarioAssertion =
	| { kind: 'file-exists'; path: string }
	| { kind: 'file-contains'; path: string; needle: string }
	| { kind: 'file-matches'; path: string; regex: string }
	| { kind: 'html-contains'; urlPath?: string; needle: string }
	| { kind: 'html-matches'; urlPath?: string; regex: string };

export interface ScenarioPhase {
	readonly name: string;
	ok: boolean;
	durationMs: number;
	note?: string;
}

export interface ScenarioScreenshot {
	readonly label: string;
	readonly path: string; // absolute
	readonly url: string;
}

export interface ScenarioResult {
	readonly name: string;
	readonly runLabel: string | null;
	readonly ok: boolean;
	readonly startedAt: string;
	readonly finishedAt: string;
	readonly projectDir: string;
	readonly logDir: string;
	readonly phases: ScenarioPhase[];
	readonly codex: CodexRunResult | null;
	readonly screenshots: ScenarioScreenshot[];
	readonly assertionFailures: string[];
	readonly devServer: { url: string; pid: number } | null;
	readonly analysis: ScenarioAnalysis;
}

export interface ScenarioAnalysis {
	readonly schemaVersion: 1;
	readonly tokens: CodexTokenTotals;
	readonly phaseTimings: readonly ScenarioPhaseTiming[];
	readonly components: {
		readonly requested: readonly string[];
		readonly imported: readonly string[];
		readonly rendered: readonly string[];
		readonly hallucinatedDryuiUiImports: readonly string[];
	};
	readonly requestedLabels: readonly string[];
	readonly missingRequestedLabels: readonly string[];
	readonly assertionFailures: readonly string[];
	readonly fileChanges: {
		readonly count: number;
		readonly paths: readonly string[];
	};
	readonly logs: Record<string, string>;
	readonly judge: null;
}

export interface CodexTokenTotals {
	readonly input: number | null;
	readonly cached: number | null;
	readonly output: number | null;
	readonly total: number | null;
	readonly turns: number;
}

export interface ScenarioPhaseTiming {
	readonly name: string;
	readonly ok: boolean;
	readonly durationMs: number;
}

export interface RunScenarioOptions {
	readonly tarballsDir?: string;
	readonly keepProject?: boolean;
	readonly verbose?: boolean;
	readonly streamCodex?: boolean;
	readonly codexStreamRaw?: boolean;
	readonly useUserCodexConfig?: boolean;
	readonly useLocalFeedbackMcp?: boolean;
	readonly visualFeedbackPass?: boolean;
	readonly agentBackend?: AgentBackend;
	readonly agentModel?: string;
	readonly usageLimitUsd?: number;
	readonly permissionMode?: string;
	readonly effort?: string;
	readonly codexTimeoutMs?: number;
	readonly runLabel?: string;
}

const RESULT_SCHEMA_VERSION = 1;
const ANALYSIS_SCHEMA_VERSION = 1;

async function getFreePort(): Promise<number> {
	return await new Promise<number>((res, rej) => {
		const srv = createServer();
		srv.unref();
		srv.on('error', rej);
		srv.listen(0, '127.0.0.1', () => {
			const addr = srv.address();
			if (addr && typeof addr === 'object') {
				const port = addr.port;
				srv.close(() => res(port));
			} else {
				srv.close(() => rej(new Error('Could not allocate port')));
			}
		});
	});
}

function nowMs(): number {
	return Date.now();
}

function phase(name: string): ScenarioPhase {
	return { name, ok: false, durationMs: 0 };
}

async function time<T>(p: ScenarioPhase, fn: () => Promise<T>): Promise<T | null> {
	const started = nowMs();
	try {
		const value = await fn();
		p.ok = true;
		p.durationMs = nowMs() - started;
		return value;
	} catch (err) {
		p.ok = false;
		p.durationMs = nowMs() - started;
		p.note = err instanceof Error ? err.message : String(err);
		return null;
	}
}

function slugPart(value: string): string {
	return (
		value
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 80) || 'run'
	);
}

function createLogDir(name: string, runLabel: string | null): string {
	const labelPart = runLabel ? `-${slugPart(runLabel)}` : '';
	const dir = resolve(repoRoot, 'reports/e2e-runs', `${slugPart(name)}${labelPart}-${Date.now()}`);
	mkdirSync(dir, { recursive: true });
	return dir;
}

function createProjectDir(name: string, runLabel: string | null): string {
	const labelPart = runLabel ? `${slugPart(runLabel)}-` : '';
	return mkdtempSync(resolve(tmpdir(), `dryui-e2e-${slugPart(name)}-${labelPart}`));
}

function scaffold(projectDir: string, tarballsDir: string, logDir: string): void {
	scaffoldDryuiConsumerProject({
		projectDir,
		tarballsDir,
		logPath: resolve(logDir, 'scaffold.log')
	});
}

function publicAssetPath(targetPath: string): string {
	const trimmed = targetPath.replace(/^\/+/, '');
	return trimmed.startsWith('static/') ? `/${trimmed.slice('static/'.length)}` : `/${trimmed}`;
}

function copyScenarioAssets(
	projectDir: string,
	assets: readonly ScenarioImageAsset[]
): readonly string[] {
	const copied: string[] = [];
	for (const asset of assets) {
		if (!existsSync(asset.sourcePath)) {
			throw new Error(`scenario asset missing: ${asset.sourcePath}`);
		}
		if (asset.targetPath.startsWith('/') || asset.targetPath.split('/').includes('..')) {
			throw new Error(`scenario asset target must be project-relative: ${asset.targetPath}`);
		}
		const targetPath = resolve(projectDir, asset.targetPath);
		if (!targetPath.startsWith(projectDir + '/')) {
			throw new Error(`scenario asset target escapes project: ${asset.targetPath}`);
		}
		mkdirSync(dirname(targetPath), { recursive: true });
		copyFileSync(asset.sourcePath, targetPath);
		copied.push(asset.targetPath);
	}
	return copied;
}

function buildScenarioPrompt(scenario: ScenarioDefinition): string {
	const assets = scenario.assets ?? [];
	if (assets.length === 0) return scenario.prompt;

	const assetLines = assets.map(
		(asset) =>
			`- ${asset.label}: use ${publicAssetPath(asset.targetPath)} (${asset.purpose}; project file ${asset.targetPath}).`
	);
	return [
		scenario.prompt,
		'',
		'Supplied PNG assets are already present in this generated project. Use these files for product, destination, hero, thumbnail, or other photographic media placeholders instead of random inline SVGs, generated data URIs, or external stock URLs.',
		'Do not crop, screenshot, or derive media assets from the mockup files; mockups are layout references only.',
		'Reference them from Svelte markup with these public URLs:',
		...assetLines
	].join('\n');
}

async function startFeedbackServer(
	projectDir: string,
	logDir: string,
	port: number
): Promise<ChildProcess> {
	const entry = resolve(repoRoot, 'packages/feedback-server/dist/server.js');
	if (!existsSync(entry)) {
		throw new Error(`feedback-server bundle missing at ${entry} — run \`bun run build:packages\``);
	}

	const logPath = resolve(logDir, 'feedback-server.log');
	const fd = openSync(logPath, 'w');

	const child = spawn(
		'bun',
		[
			'run',
			entry,
			'--port',
			String(port),
			'--host',
			'127.0.0.1',
			'--project',
			projectDir,
			// Critical: without this, attachDispatcher subscribes to submission.created
			// and fires `open codex://new?...` on macOS — which is how the Codex desktop
			// app kept popping up on every scenario run. We drive Codex ourselves via
			// `codex exec` in codex-runner.ts, so the server must not dispatch too.
			'--no-dispatch'
		],
		{
			cwd: projectDir,
			stdio: ['ignore', fd, fd]
		}
	);
	// We don't need to keep the fd open — stdio inherits it via dup2 on spawn.
	closeSync(fd);

	const healthUrl = `http://127.0.0.1:${port}/health`;
	if (!(await waitForUrl(healthUrl, 10_000))) {
		try {
			child.kill('SIGTERM');
		} catch {}
		throw new Error(`feedback server failed to become healthy at ${healthUrl}`);
	}
	return child;
}

interface FeedbackSubmissionPostOptions {
	readonly url: string;
	readonly prompt: string;
	readonly viewport: { width: number; height: number };
	readonly pngBase64?: string;
	readonly webpBase64?: string;
}

async function postFeedbackSubmission(
	port: number,
	options: FeedbackSubmissionPostOptions
): Promise<{ id: string }> {
	const body = {
		url: options.url,
		image: {
			webp: options.webpBase64 ?? BLANK_WEBP_BASE64,
			png: options.pngBase64 ?? BLANK_PNG_BASE64
		},
		viewport: options.viewport,
		scroll: { x: 0, y: 0 },
		drawings: [
			{
				id: 'synthetic-note',
				kind: 'text',
				color: '#0f766e',
				position: { x: 40, y: 40 },
				text: options.prompt,
				fontSize: 16
			}
		]
	};
	const response = await fetch(`http://127.0.0.1:${port}/submissions`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
		signal: AbortSignal.timeout(FEEDBACK_FETCH_TIMEOUT_MS)
	});
	if (!response.ok) {
		throw new Error(`submissions POST ${response.status}: ${await response.text()}`);
	}
	const submission = (await response.json()) as { id: string };
	return submission;
}

async function postSyntheticFeedback(port: number, prompt: string): Promise<{ id: string }> {
	return postFeedbackSubmission(port, {
		url: `http://127.0.0.1:${port}/synthetic-e2e`,
		prompt,
		viewport: { width: 1280, height: 800 }
	});
}

async function assertPendingSubmission(port: number, submissionId: string): Promise<void> {
	const response = await fetch(`http://127.0.0.1:${port}/submissions?status=pending`, {
		signal: AbortSignal.timeout(FEEDBACK_FETCH_TIMEOUT_MS)
	});
	if (!response.ok) throw new Error(`submissions GET ${response.status}`);
	const data = (await response.json()) as { count: number; submissions: Array<{ id: string }> };
	if (!data.submissions.some((s) => s.id === submissionId)) {
		throw new Error(`submission ${submissionId} not visible in pending list`);
	}
}

async function runProjectBuild(projectDir: string, logDir: string): Promise<void> {
	const logPath = resolve(logDir, 'build.log');
	const fd = openSync(logPath, 'w');
	try {
		await new Promise<void>((res, rej) => {
			const child = spawn('bun', ['run', 'build'], {
				cwd: projectDir,
				stdio: ['ignore', fd, fd]
			});
			child.on('error', rej);
			child.on('close', (code) => {
				if (code === 0) res();
				else rej(new Error(`bun run build exited ${code} (see ${logPath})`));
			});
		});
	} finally {
		closeSync(fd);
	}
}

async function startDevServer(
	projectDir: string,
	logDir: string,
	port: number,
	detach: boolean
): Promise<ChildProcess> {
	const logPath = resolve(logDir, 'dev-server.log');
	const fd = openSync(logPath, 'w');
	// `detached: true` gives the child its own process group so this parent's
	// exit doesn't SIGHUP it — needed for --keep-project.
	const child = spawn(
		'bun',
		['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
		{
			cwd: projectDir,
			stdio: ['ignore', fd, fd],
			detached: detach
		}
	);
	closeSync(fd);
	const url = `http://127.0.0.1:${port}/`;
	if (!(await waitForUrl(url, 30_000))) {
		killChild(child);
		throw new Error(`dev server failed to become healthy at ${url} (see ${logPath})`);
	}
	return child;
}

interface AssertionRunResult {
	readonly failures: string[];
	readonly screenshots: ScenarioScreenshot[];
}

interface ScenarioResultDraft extends Omit<ScenarioResult, 'analysis'> {}

interface DryuiImport {
	readonly name: string;
	readonly module: string;
}

async function runAssertions(
	projectDir: string,
	logDir: string,
	devUrlBase: string,
	assertions: readonly ScenarioAssertion[],
	screenshotLabelPrefix = ''
): Promise<AssertionRunResult> {
	const { chromium } = await import('playwright');
	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
	const page = await context.newPage();
	const failures: string[] = [];
	const screenshots: ScenarioScreenshot[] = [];
	const htmlCache = new Map<string, string>();
	const screenshotDir = resolve(logDir, 'screenshots');
	mkdirSync(screenshotDir, { recursive: true });

	try {
		async function visit(pathname: string): Promise<string> {
			const cached = htmlCache.get(pathname);
			if (cached !== undefined) return cached;
			await page.goto(devUrlBase + pathname, { waitUntil: 'networkidle', timeout: 30_000 });
			const html = await page.content();
			htmlCache.set(pathname, html);
			return html;
		}

		async function shoot(label: string, pathname: string): Promise<void> {
			const effectiveLabel = `${screenshotLabelPrefix}${label}`;
			// Force a real navigation so `emulateMedia` changes are applied — the
			// `visit()` cache would short-circuit and give us a light-mode snap
			// under a dark backdrop.
			await page.goto(devUrlBase + pathname, { waitUntil: 'networkidle', timeout: 30_000 });
			const filePath = resolve(screenshotDir, `${effectiveLabel}.png`);
			await page.screenshot({ path: filePath, fullPage: false });
			screenshots.push({ label: effectiveLabel, path: filePath, url: devUrlBase + pathname });
		}

		await shoot('home', '/');
		try {
			await page.emulateMedia({ colorScheme: 'dark' });
			await shoot('home-dark', '/');
			await page.emulateMedia({ colorScheme: 'light' });
		} catch {}

		for (const assertion of assertions) {
			if (assertion.kind === 'file-exists') {
				const abs = resolve(projectDir, assertion.path);
				if (!existsSync(abs)) failures.push(`file-exists: missing ${assertion.path}`);
			} else if (assertion.kind === 'file-contains') {
				const abs = resolve(projectDir, assertion.path);
				if (!existsSync(abs)) {
					failures.push(`file-contains: missing ${assertion.path}`);
					continue;
				}
				const content = readFileSync(abs, 'utf8');
				if (!content.includes(assertion.needle)) {
					failures.push(`file-contains: ${assertion.path} missing "${assertion.needle}"`);
				}
			} else if (assertion.kind === 'file-matches') {
				const abs = resolve(projectDir, assertion.path);
				if (!existsSync(abs)) {
					failures.push(`file-matches: missing ${assertion.path}`);
					continue;
				}
				const content = readFileSync(abs, 'utf8');
				const re = new RegExp(assertion.regex, 'i');
				if (!re.test(content)) {
					failures.push(`file-matches: ${assertion.path} failed /${assertion.regex}/i`);
				}
			} else if (assertion.kind === 'html-contains') {
				const urlPath = assertion.urlPath ?? '/';
				const html = await visit(urlPath);
				if (!html.toLowerCase().includes(assertion.needle.toLowerCase())) {
					failures.push(`html-contains: ${urlPath} missing "${assertion.needle}"`);
				}
			} else if (assertion.kind === 'html-matches') {
				const urlPath = assertion.urlPath ?? '/';
				const html = await visit(urlPath);
				const re = new RegExp(assertion.regex, 'i');
				if (!re.test(html)) {
					failures.push(`html-matches: ${urlPath} failed /${assertion.regex}/i`);
				}
			}
		}
	} finally {
		await browser.close();
	}
	return { failures, screenshots };
}

async function captureFeedbackSubmissionScreenshot(
	logDir: string,
	devUrlBase: string
): Promise<{ pngBase64: string; screenshot: ScenarioScreenshot }> {
	const { chromium } = await import('playwright');
	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
	const page = await context.newPage();
	const screenshotDir = resolve(logDir, 'screenshots');
	mkdirSync(screenshotDir, { recursive: true });
	const filePath = resolve(screenshotDir, 'home-before-feedback.png');
	try {
		await page.goto(devUrlBase + '/', { waitUntil: 'networkidle', timeout: 30_000 });
		const bytes = await page.screenshot({ path: filePath, fullPage: false });
		return {
			pngBase64: Buffer.from(bytes).toString('base64'),
			screenshot: { label: 'home-before-feedback', path: filePath, url: devUrlBase + '/' }
		};
	} finally {
		await browser.close();
	}
}

function killChild(child: ChildProcess | null): void {
	if (child?.pid) killOwnedProcess(child.pid);
}

function killOwnedProcess(pid: number): void {
	try {
		process.kill(-pid, 'SIGTERM');
	} catch {
		try {
			process.kill(pid, 'SIGTERM');
		} catch {
			/* already exited */
		}
	}
}

function describeCodexLine(line: string): string | null {
	const trimmed = line.trim();
	if (!trimmed) return null;
	try {
		const event = JSON.parse(trimmed) as Record<string, unknown>;
		const type = stringValue(event.type);
		if (!type) return null;
		if (type === 'turn.started' || type === 'turn.completed') return type;
		if (type === 'item.started' || type === 'item.completed') {
			const item = asRecord(event.item);
			const itemType = item ? firstString(item, ['type']) : null;
			const status = item ? firstString(item, ['status']) : null;
			const title = item ? firstString(item, ['title', 'path', 'command']) : null;
			return [
				type,
				itemType ? ` ${itemType}` : '',
				status ? ` ${status}` : '',
				title ? `: ${compactText(title, 120)}` : ''
			].join('');
		}
		if (type === 'assistant') {
			const message = asRecord(event.message);
			const content = Array.isArray(message?.content) ? message.content : [];
			const toolUse = content.map(asRecord).find((part) => part?.type === 'tool_use');
			if (toolUse) {
				const name = stringValue(toolUse.name) ?? 'tool';
				const input = asRecord(toolUse.input);
				const detail = input
					? (firstString(input, ['file_path', 'command', 'pattern', 'path']) ??
						JSON.stringify(input).slice(0, 120))
					: null;
				return detail ? `tool ${name}: ${compactText(detail, 160)}` : `tool ${name}`;
			}
			const text = contentText(content);
			return text ? `assistant: ${compactText(text, 160)}` : 'assistant';
		}
		if (type === 'system') {
			const subtype = stringValue(event.subtype);
			const description = stringValue(event.description);
			if (subtype === 'task_progress' && description) return compactText(description, 160);
			return subtype ? `system ${subtype}` : 'system';
		}
		if (type === 'user') {
			const message = asRecord(event.message);
			const content = Array.isArray(message?.content) ? message.content : [];
			const toolResult = content.map(asRecord).find((part) => part?.type === 'tool_result');
			if (toolResult) {
				const isError = toolResult.is_error === true ? ' error' : '';
				return `tool result${isError}`;
			}
			return 'user';
		}
		if (type === 'result') {
			const subtype = stringValue(event.subtype);
			const cost = typeof event.total_cost_usd === 'number' ? ` cost=$${event.total_cost_usd}` : '';
			return `result${subtype ? ` ${subtype}` : ''}${cost}`;
		}
		if (type === 'error') return 'error';
		return type;
	} catch {
		return null;
	}
}

function asRecord(value: unknown): Record<string, unknown> | null {
	return value && typeof value === 'object' && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: null;
}

function stringValue(value: unknown): string | null {
	return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function compactText(value: string, max = 600): string {
	const oneLine = value.replace(/\s+/g, ' ').trim();
	return oneLine.length > max ? `${oneLine.slice(0, max - 1)}…` : oneLine;
}

function firstString(record: Record<string, unknown>, keys: readonly string[]): string | null {
	for (const key of keys) {
		const value = stringValue(record[key]);
		if (value) return value;
	}
	return null;
}

function contentText(value: unknown): string | null {
	const direct = stringValue(value);
	if (direct) return direct;
	if (Array.isArray(value)) {
		const parts = value
			.map((part) => {
				const record = asRecord(part);
				return record
					? firstString(record, ['text', 'message', 'content', 'delta'])
					: stringValue(part);
			})
			.filter((part): part is string => part !== null);
		return parts.length > 0 ? parts.join(' ') : null;
	}
	const record = asRecord(value);
	if (!record) return null;
	return (
		firstString(record, ['text', 'message', 'content', 'delta', 'output', 'error']) ??
		contentText(record.content)
	);
}

function formatCodexStreamLine(line: string): string | null {
	const trimmed = line.trim();
	if (!trimmed) return null;
	try {
		const event = JSON.parse(trimmed) as Record<string, unknown>;
		const type = stringValue(event.type) ?? 'event';
		const item = asRecord(event.item);
		if (type === 'thread.started') {
			const threadId = stringValue(event.thread_id);
			return threadId ? `thread started ${threadId}` : 'thread started';
		}
		if (type === 'turn.started') return 'turn started';
		if (type === 'turn.completed') {
			const usage = asRecord(event.usage);
			if (!usage) return 'turn completed';
			const input = usage.input_tokens ?? '?';
			const cached = usage.cached_input_tokens ?? '?';
			const output = usage.output_tokens ?? '?';
			return `turn completed tokens in=${input} cached=${cached} out=${output}`;
		}
		if (type === 'item.started' || type === 'item.completed' || type === 'item.updated') {
			const itemType = item ? firstString(item, ['type']) : null;
			const status = item ? firstString(item, ['status']) : null;
			const title = item ? firstString(item, ['title', 'path', 'command']) : null;
			const text = item
				? (contentText(item.content) ??
					firstString(item, ['text', 'message', 'delta', 'output', 'error']))
				: null;
			const details = [itemType, status, title].filter((part): part is string => part !== null);
			const suffix = text ? `: ${compactText(text)}` : '';
			return `${type}${details.length > 0 ? ` ${details.join(' ')}` : ''}${suffix}`;
		}
		if (type === 'assistant' || type === 'system' || type === 'user' || type === 'result') {
			return describeCodexLine(line);
		}
		const text =
			contentText(event.content) ??
			firstString(event, ['text', 'message', 'delta', 'output', 'error', 'error_message']);
		return text ? `${type}: ${compactText(text)}` : type;
	} catch {
		return compactText(trimmed);
	}
}

function assertDryuiBuildSkillAvailable(result: CodexRunResult): void {
	const transcript = [
		result.lastMessage,
		...result.events.map((event) => JSON.stringify(event))
	].join('\n');
	const unavailablePatterns = [
		/don[’']?t have (?:a )?`?dryui-build`? skill/i,
		/no `?dryui-build`? skill/i,
		/`?dryui-build`? skill (?:is )?(?:not installed|unavailable|missing)/i
	];
	if (unavailablePatterns.some((pattern) => pattern.test(transcript))) {
		throw new Error(
			`${result.backend} reported that dryui-build was unavailable; generated projects must expose the DryUI skill bundle`
		);
	}
}

function buildVisualFeedbackPrompt(submissionId: string): string {
	return [
		`Apply DryUI feedback submission ${submissionId}.`,
		'',
		'Use the dryui-feedback MCP tools: call feedback_get_submissions, read the preferredScreenshotPath, decode the text note, and make one focused visual or UX repair.',
		'This is a generated SvelteKit + DryUI consumer project. Prefer editing src/routes/+page.svelte only unless the feedback clearly requires an adjacent app CSS or layout CSS change.',
		'Do not replay the original build prompt. Improve the rendered UI that already exists.',
		'Run `bun run build` after editing. If the build passes, call feedback_resolve_submission for the submission id before finalizing.'
	].join('\n');
}

export async function runScenario(
	scenario: ScenarioDefinition,
	options: RunScenarioOptions = {}
): Promise<ScenarioResult> {
	const tarballsDir = options.tarballsDir ? resolve(options.tarballsDir) : defaultTarballsDir;
	if (!existsSync(resolve(tarballsDir, 'manifest.json'))) {
		throw new Error(
			`tarballs manifest missing at ${tarballsDir}/manifest.json — run \`bun run e2e:pack\``
		);
	}

	const runLabel = options.runLabel ?? null;
	const displayName = runLabel ? `${scenario.name}/${runLabel}` : scenario.name;
	const scenarioPrompt = buildScenarioPrompt(scenario);
	const projectDir = createProjectDir(scenario.name, runLabel);
	const logDir = createLogDir(scenario.name, runLabel);
	const phases: ScenarioPhase[] = [];
	let codex: CodexRunResult | null = null;
	let feedbackChild: ChildProcess | null = null;
	let devChild: ChildProcess | null = null;
	let screenshots: ScenarioScreenshot[] = [];
	let assertionFailures: string[] = [];
	const startedAt = new Date().toISOString();
	const [feedbackPort, devPort] = await Promise.all([getFreePort(), getFreePort()]);
	const agentBackend = options.agentBackend ?? 'codex';
	const agentModel = options.agentModel ?? scenario.codexModel;

	const log = (msg: string) => {
		if (options.verbose) console.log(`[${displayName}] ${msg}`);
	};
	const progress = (msg: string) => {
		console.log(`[${displayName}] ${msg}`);
	};
	const runPhase = async <T>(p: ScenarioPhase, fn: () => Promise<T>): Promise<T | null> => {
		progress(`${p.name}…`);
		const result = await time(p, fn);
		const duration = `${(p.durationMs / 1000).toFixed(1)}s`;
		const note = p.note ? ` (${p.note})` : '';
		progress(`${p.ok ? '✓' : '✗'} ${p.name} ${duration}${note}`);
		return result;
	};

	try {
		log(`project dir: ${projectDir}`);
		log(`log dir: ${logDir}`);

		const pScaffold = phase('scaffold');
		phases.push(pScaffold);
		await runPhase(pScaffold, async () => {
			scaffold(projectDir, tarballsDir, logDir);
		});
		if (!pScaffold.ok) return finalize(false);

		if ((scenario.assets?.length ?? 0) > 0) {
			const pAssets = phase('assets');
			phases.push(pAssets);
			await runPhase(pAssets, async () => {
				const copied = copyScenarioAssets(projectDir, scenario.assets ?? []);
				pAssets.note = `${copied.length} image${copied.length === 1 ? '' : 's'}`;
			});
			if (!pAssets.ok) return finalize(false);
		}

		const pFeedbackUp = phase('feedback-up');
		phases.push(pFeedbackUp);
		feedbackChild = await runPhase(pFeedbackUp, async () => {
			return await startFeedbackServer(projectDir, logDir, feedbackPort);
		});
		if (!pFeedbackUp.ok) return finalize(false);

		const pSubmission = phase('feedback-submission');
		phases.push(pSubmission);
		await runPhase(pSubmission, async () => {
			const submission = await postSyntheticFeedback(feedbackPort, scenarioPrompt);
			await assertPendingSubmission(feedbackPort, submission.id);
			pSubmission.note = `id=${submission.id}`;
		});
		killChild(feedbackChild);
		feedbackChild = null;

		if (!pSubmission.ok) return finalize(false);

		const pCodex = phase(`agent-${agentBackend}`);
		phases.push(pCodex);
		codex = await runPhase(pCodex, async () => {
			let lastAgentEvent = 'starting';
			const started = Date.now();
			const codexTimeoutMs = options.codexTimeoutMs ?? scenario.codexTimeoutMs;
			const streamCodex = options.streamCodex === true;
			const streamRawCodex = options.codexStreamRaw === true || options.verbose === true;
			if (options.useUserCodexConfig === true) {
				progress(`${agentBackend} config: user config`);
			} else if (options.useLocalFeedbackMcp !== false) {
				progress(`${agentBackend} config: local feedback MCP`);
			} else {
				progress(`${agentBackend} config: isolated without feedback MCP`);
			}
			if (agentModel) progress(`${agentBackend} model: ${agentModel}`);
			if (options.effort) progress(`${agentBackend} effort: ${options.effort}`);
			if (options.usageLimitUsd !== undefined) {
				progress(`${agentBackend} usage limit: $${options.usageLimitUsd}`);
			}
			const heartbeat = setInterval(() => {
				progress(
					`${agentBackend} still running (${((Date.now() - started) / 1000).toFixed(0)}s): ${lastAgentEvent}`
				);
			}, CODEX_HEARTBEAT_MS);
			heartbeat.unref();
			try {
				const result = await runAgentExec({
					backend: agentBackend,
					projectDir,
					prompt: scenarioPrompt,
					logDir,
					...(agentModel ? { model: agentModel } : {}),
					...(options.usageLimitUsd !== undefined ? { usageLimitUsd: options.usageLimitUsd } : {}),
					...(options.permissionMode ? { permissionMode: options.permissionMode } : {}),
					...(options.effort ? { effort: options.effort } : {}),
					...(codexTimeoutMs !== undefined ? { timeoutMs: codexTimeoutMs } : {}),
					useUserConfig: options.useUserCodexConfig === true,
					useLocalFeedbackMcp: options.useLocalFeedbackMcp !== false,
					onStdoutLine: (line) => {
						const description = describeCodexLine(line);
						if (description) lastAgentEvent = description;
						if (streamRawCodex) {
							console.log(`[${displayName}] ${agentBackend} json: ${line}`);
						} else if (streamCodex) {
							const formatted = formatCodexStreamLine(line);
							if (formatted) console.log(`[${displayName}] ${agentBackend} ${formatted}`);
						}
					},
					onStderrLine: (line) => {
						lastAgentEvent = line;
						if (line.trim() === CODEX_STDIN_NOTICE) {
							if (streamCodex || streamRawCodex || options.verbose) {
								console.log(`[${displayName}] ${agentBackend} info: ${line}`);
							}
							return;
						}
						console.error(`[${displayName}] ${agentBackend} stderr: ${line}`);
					}
				});
				if (!result.ok) {
					throw new Error(`${agentBackend} exec failed\n${summarizeCodexRun(result)}`);
				}
				assertDryuiBuildSkillAvailable(result);
				return result;
			} finally {
				clearInterval(heartbeat);
			}
		});
		if (!pCodex.ok) return finalize(false);

		const pBuild = phase('build');
		phases.push(pBuild);
		await runPhase(pBuild, async () => {
			await runProjectBuild(projectDir, logDir);
		});
		if (!pBuild.ok) return finalize(false);

		const pDevUp = phase('dev-up');
		phases.push(pDevUp);
		devChild = await runPhase(pDevUp, async () => {
			return await startDevServer(projectDir, logDir, devPort, options.keepProject === true);
		});
		if (!pDevUp.ok) return finalize(false);

		const pAsserts = phase('assertions');
		phases.push(pAsserts);
		await runPhase(pAsserts, async () => {
			const result = await runAssertions(
				projectDir,
				logDir,
				`http://127.0.0.1:${devPort}`,
				scenario.assertions
			);
			screenshots = result.screenshots;
			assertionFailures = result.failures;
			if (result.failures.length > 0) {
				pAsserts.note = result.failures.join('; ');
				throw new Error(
					`${result.failures.length} assertion(s) failed: ${result.failures.join('; ')}`
				);
			}
			pAsserts.note = `${scenario.assertions.length} ok`;
		});
		if (!pAsserts.ok) return finalize(false);

		if (options.visualFeedbackPass === true) {
			const feedbackBaseUrl = `http://127.0.0.1:${feedbackPort}`;
			let visualSubmissionId = '';

			const pVisualFeedbackUp = phase('visual-feedback-up');
			phases.push(pVisualFeedbackUp);
			feedbackChild = await runPhase(pVisualFeedbackUp, async () => {
				return await startFeedbackServer(projectDir, logDir, feedbackPort);
			});
			if (!pVisualFeedbackUp.ok) return finalize(false);

			const pVisualFeedbackCapture = phase('visual-feedback-capture');
			phases.push(pVisualFeedbackCapture);
			await runPhase(pVisualFeedbackCapture, async () => {
				const capture = await captureFeedbackSubmissionScreenshot(
					logDir,
					`http://127.0.0.1:${devPort}`
				);
				screenshots = [...screenshots, capture.screenshot];
				const submission = await postFeedbackSubmission(feedbackPort, {
					url: `http://127.0.0.1:${devPort}/`,
					prompt: [
						`Review this rendered ${scenario.name} UI against the scenario brief.`,
						'Fix the most obvious visual, UX, or skipped-component issue only.',
						'Keep the repair focused; do not rebuild the whole page.'
					].join(' '),
					viewport: { width: 1280, height: 900 },
					pngBase64: capture.pngBase64
				});
				visualSubmissionId = submission.id;
				await assertPendingSubmission(feedbackPort, submission.id);
				pVisualFeedbackCapture.note = `id=${submission.id}`;
			});
			if (!pVisualFeedbackCapture.ok) return finalize(false);

			const pCodexFeedback = phase(`feedback-${agentBackend}`);
			phases.push(pCodexFeedback);
			await runPhase(pCodexFeedback, async () => {
				if (options.useLocalFeedbackMcp === false) {
					throw new Error('--visual-feedback-pass requires feedback MCP');
				}
				const result = await runAgentExec({
					backend: agentBackend,
					projectDir,
					prompt: buildVisualFeedbackPrompt(visualSubmissionId),
					logDir: resolve(logDir, 'feedback-codex'),
					...(agentModel ? { model: agentModel } : {}),
					...(options.usageLimitUsd !== undefined ? { usageLimitUsd: options.usageLimitUsd } : {}),
					...(options.permissionMode ? { permissionMode: options.permissionMode } : {}),
					...(options.effort ? { effort: options.effort } : {}),
					...((options.codexTimeoutMs ?? scenario.codexTimeoutMs)
						? { timeoutMs: options.codexTimeoutMs ?? scenario.codexTimeoutMs }
						: {}),
					useUserConfig: options.useUserCodexConfig === true,
					useLocalFeedbackMcp: true,
					feedbackBaseUrl,
					onStdoutLine: (line) => {
						if (options.streamCodex === true) {
							const formatted = formatCodexStreamLine(line);
							if (formatted) console.log(`[${displayName}] feedback ${agentBackend} ${formatted}`);
						}
					},
					onStderrLine: (line) => {
						if (line.trim() && line.trim() !== CODEX_STDIN_NOTICE) {
							console.error(`[${displayName}] feedback ${agentBackend} stderr: ${line}`);
						}
					}
				});
				if (!result.ok) {
					throw new Error(`feedback ${agentBackend} exec failed\n${summarizeCodexRun(result)}`);
				}
				assertDryuiBuildSkillAvailable(result);
				pCodexFeedback.note = summarizeCodexRun(result).split('\n').slice(0, 2).join('; ');
			});
			if (!pCodexFeedback.ok) return finalize(false);

			killChild(feedbackChild);
			feedbackChild = null;

			const pBuildAfterFeedback = phase('build-after-feedback');
			phases.push(pBuildAfterFeedback);
			await runPhase(pBuildAfterFeedback, async () => {
				await runProjectBuild(projectDir, logDir);
			});
			if (!pBuildAfterFeedback.ok) return finalize(false);

			const pAssertsAfterFeedback = phase('assertions-after-feedback');
			phases.push(pAssertsAfterFeedback);
			await runPhase(pAssertsAfterFeedback, async () => {
				const result = await runAssertions(
					projectDir,
					logDir,
					`http://127.0.0.1:${devPort}`,
					scenario.assertions,
					'after-feedback-'
				);
				screenshots = [...screenshots, ...result.screenshots];
				const failures = result.failures.map((failure) => `after-feedback: ${failure}`);
				assertionFailures = [...assertionFailures, ...failures];
				if (failures.length > 0) {
					pAssertsAfterFeedback.note = failures.join('; ');
					throw new Error(
						`${failures.length} post-feedback assertion(s) failed: ${failures.join('; ')}`
					);
				}
				pAssertsAfterFeedback.note = `${scenario.assertions.length} ok`;
			});
			if (!pAssertsAfterFeedback.ok) return finalize(false);
		}

		return finalize(phases.every((p) => p.ok));
	} finally {
		killChild(feedbackChild);
		if (options.keepProject) {
			// Dev server survives this process via `detached: true` at spawn time;
			// unref so node's event loop can exit without waiting on it.
			devChild?.unref();
		} else {
			killChild(devChild);
		}
	}

	function finalize(ok: boolean): ScenarioResult {
		const devServer =
			options.keepProject && devChild?.pid
				? { url: `http://127.0.0.1:${devPort}/`, pid: devChild.pid }
				: null;
		const baseResult: ScenarioResultDraft = {
			name: scenario.name,
			runLabel,
			ok,
			startedAt,
			finishedAt: new Date().toISOString(),
			projectDir,
			logDir,
			phases,
			codex,
			screenshots,
			assertionFailures,
			devServer
		};
		const result: ScenarioResult = {
			...baseResult,
			analysis: buildScenarioAnalysis(scenario, baseResult)
		};
		writeResultJson(result);
		return result;
	}
}

function buildScenarioAnalysis(
	scenario: ScenarioDefinition,
	result: ScenarioResultDraft
): ScenarioAnalysis {
	const requestedComponents = extractRequestedComponents(scenario.prompt);
	const sourceFiles = readProjectSourceFiles(result.projectDir);
	const dryuiImports = extractDryuiImports(sourceFiles);
	const imported = uniqueSorted(dryuiImports.map((entry) => entry.name));
	const rendered = extractRenderedComponents(sourceFiles, imported);
	const hallucinated = uniqueSorted(
		dryuiImports
			.filter((entry) => !getDryuiUiExports(entry.module).has(entry.name))
			.map((entry) => entry.name)
	);
	const requestedLabels = extractRequestedLabels(scenario);

	return {
		schemaVersion: ANALYSIS_SCHEMA_VERSION,
		tokens: result.codex ? extractCodexTokenTotals(result.codex) : emptyTokenTotals(),
		phaseTimings: result.phases.map((p) => ({
			name: p.name,
			ok: p.ok,
			durationMs: p.durationMs
		})),
		components: {
			requested: requestedComponents,
			imported,
			rendered,
			hallucinatedDryuiUiImports: hallucinated
		},
		requestedLabels,
		missingRequestedLabels: extractMissingRequestedLabels(result.assertionFailures),
		assertionFailures: result.assertionFailures,
		fileChanges: {
			count: result.codex?.fileChanges.length ?? 0,
			paths: result.codex?.fileChanges ?? []
		},
		logs: collectLogPaths(result.logDir),
		judge: null
	};
}

function writeResultJson(result: ScenarioResult): void {
	const payload = {
		schemaVersion: RESULT_SCHEMA_VERSION,
		name: result.name,
		runLabel: result.runLabel,
		ok: result.ok,
		startedAt: result.startedAt,
		finishedAt: result.finishedAt,
		projectDir: result.projectDir,
		logDir: result.logDir,
		devServer: result.devServer,
		phases: result.phases.map((p) => ({
			name: p.name,
			ok: p.ok,
			durationMs: p.durationMs,
			note: p.note ?? null
		})),
		codex: result.codex
			? {
					backend: result.codex.backend,
					model: result.codex.model,
					effort: result.codex.effort,
					exitCode: result.codex.exitCode,
					durationMs: result.codex.durationMs,
					eventCount: result.codex.events.length,
					fileChanges: result.codex.fileChanges,
					tokens: extractCodexTokens(result.codex),
					lastMessage: result.codex.lastMessage
				}
			: null,
		screenshots: result.screenshots.map((s) => ({
			label: s.label,
			// Store path relative to logDir so the report can reference it without
			// caring where the repo lives on disk.
			path: relativeToLogDir(s.path, result.logDir),
			url: s.url
		})),
		assertionFailures: result.assertionFailures,
		analysis: result.analysis
	};
	writeFileSync(resolve(result.logDir, 'result.json'), JSON.stringify(payload, null, 2) + '\n');
	writeFileSync(
		resolve(result.logDir, 'analysis.json'),
		JSON.stringify(result.analysis, null, 2) + '\n'
	);
}

function extractCodexTokens(codex: CodexRunResult): {
	input: number | null;
	cached: number | null;
	output: number | null;
} {
	const totals = extractCodexTokenTotals(codex);
	return { input: totals.input, cached: totals.cached, output: totals.output };
}

function emptyTokenTotals(): CodexTokenTotals {
	return { input: null, cached: null, output: null, total: null, turns: 0 };
}

function extractCodexTokenTotals(codex: CodexRunResult): CodexTokenTotals {
	let input = 0;
	let cached = 0;
	let output = 0;
	let hasInput = false;
	let hasCached = false;
	let hasOutput = false;
	let turns = 0;

	for (const event of codex.events) {
		const usage =
			event.type === 'turn.completed' && typeof event.usage === 'object' && event.usage !== null
				? (event.usage as Record<string, unknown>)
				: event.type === 'assistant' &&
					  typeof (event.message as Record<string, unknown> | undefined)?.usage === 'object' &&
					  (event.message as Record<string, unknown> | undefined)?.usage !== null
					? ((event.message as Record<string, unknown>).usage as Record<string, unknown>)
					: null;
		if (!usage) continue;
		if (event.type === 'turn.completed' || event.type === 'assistant') turns++;
		const inputTokens = numberValue(usage.input_tokens) ?? numberValue(usage.inputTokens) ?? 0;
		const cacheCreation =
			numberValue(usage.cache_creation_input_tokens) ??
			numberValue(usage.cacheCreationInputTokens) ??
			0;
		const cacheRead =
			numberValue(usage.cached_input_tokens) ??
			numberValue(usage.cache_read_input_tokens) ??
			numberValue(usage.cacheReadInputTokens) ??
			0;
		const outputTokens = numberValue(usage.output_tokens) ?? numberValue(usage.outputTokens) ?? 0;
		if (inputTokens > 0 || cacheCreation > 0) {
			input += inputTokens + cacheCreation;
			hasInput = true;
		}
		if (cacheRead > 0) {
			cached += cacheRead;
			hasCached = true;
		}
		if (outputTokens > 0) {
			output += outputTokens;
			hasOutput = true;
		}
	}

	const resolvedInput = hasInput ? input : null;
	const resolvedCached = hasCached ? cached : null;
	const resolvedOutput = hasOutput ? output : null;
	const total =
		resolvedInput === null && resolvedOutput === null
			? null
			: (resolvedInput ?? 0) + (resolvedOutput ?? 0);

	return {
		input: resolvedInput,
		cached: resolvedCached,
		output: resolvedOutput,
		total,
		turns
	};
}

function numberValue(value: unknown): number | null {
	return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function extractRequestedLabels(scenario: ScenarioDefinition): string[] {
	const labels = new Set<string>();
	for (const assertion of scenario.assertions) {
		if ('needle' in assertion) labels.add(assertion.needle);
	}
	for (const match of scenario.prompt.matchAll(/exact [^.\n:]*"([^"]+)"/gi)) {
		labels.add(match[1]!);
	}
	for (const match of scenario.prompt.matchAll(
		/\(([^()"]*(?:"[^"]+"(?:\s*\/\s*"[^"]+")+)[^()]*)\)/g
	)) {
		for (const label of match[1]!.matchAll(/"([^"]+)"/g)) labels.add(label[1]!);
	}
	const required =
		scenario.prompt.match(/Required structure[\s\S]*?(?:\n\n|Do not edit)/i)?.[0] ?? '';
	for (const match of required.matchAll(/"([^"]{1,60})"/g)) {
		labels.add(match[1]!);
	}
	return [...labels].sort((a, b) => a.localeCompare(b));
}

function extractMissingRequestedLabels(assertionFailures: readonly string[]): string[] {
	const missing = new Set<string>();
	for (const failure of assertionFailures) {
		for (const match of failure.matchAll(/missing "([^"]+)"/g)) {
			missing.add(match[1]!);
		}
	}
	return [...missing].sort((a, b) => a.localeCompare(b));
}

function extractRequestedComponents(prompt: string): string[] {
	const names = new Set<string>();
	const requestedBlocks = prompt.matchAll(
		/Pick from:\n([\s\S]*?)(?:\nDryUI|\nImport|\nReal imagery|\n\n)/g
	);
	for (const block of requestedBlocks) {
		const text = block[1] ?? '';
		for (const match of text.matchAll(/\b[A-Z][A-Za-z0-9]*(?:\.[A-Z][A-Za-z0-9]*)?\b/g)) {
			const name = match[0]!;
			if (name !== 'DryUI') names.add(name.split('.')[0]!);
		}
	}
	return [...names].sort((a, b) => a.localeCompare(b));
}

function readProjectSourceFiles(projectDir: string): string[] {
	const srcDir = resolve(projectDir, 'src');
	const files: string[] = [];
	function walk(dir: string): void {
		if (!existsSync(dir)) return;
		for (const entry of readdirSync(dir)) {
			const path = resolve(dir, entry);
			const stat = statSync(path);
			if (stat.isDirectory()) {
				walk(path);
			} else if (/\.(svelte|ts|js)$/.test(entry)) {
				files.push(readFileSync(path, 'utf8'));
			}
		}
	}
	walk(srcDir);
	return files;
}

function extractDryuiImports(files: readonly string[]): DryuiImport[] {
	const imported: DryuiImport[] = [];
	for (const content of files) {
		for (const match of content.matchAll(
			/import\s*\{([^}]+)\}\s*from\s*['"](@dryui\/ui(?:\/[^'"]*)?)['"]/g
		)) {
			for (const part of match[1]!.split(',')) {
				const name = part
					.trim()
					.split(/\s+as\s+/i)[0]
					?.trim();
				if (name && /^[A-Z][A-Za-z0-9]*$/.test(name)) {
					imported.push({ name, module: match[2]! });
				}
			}
		}
	}
	return imported;
}

function extractRenderedComponents(
	files: readonly string[],
	imported: readonly string[]
): string[] {
	const rendered = new Set<string>();
	const importedSet = new Set(imported);
	for (const content of files) {
		for (const match of content.matchAll(/<\/?([A-Z][A-Za-z0-9]*)(?:\.[A-Z][A-Za-z0-9]*)?\b/g)) {
			const name = match[1]!;
			if (importedSet.has(name)) rendered.add(name);
		}
	}
	return [...rendered].sort((a, b) => a.localeCompare(b));
}

function getDryuiUiExports(moduleName: string): Set<string> {
	const subpath = moduleName.replace(/^@dryui\/ui\/?/, '');
	const indexPath =
		subpath.length === 0
			? resolve(repoRoot, 'packages/ui/src/index.ts')
			: resolve(repoRoot, 'packages/ui/src', subpath, 'index.ts');
	const exports = new Set<string>();
	if (!existsSync(indexPath)) return exports;
	const content = readFileSync(indexPath, 'utf8');
	for (const match of content.matchAll(/export\s*\{([^}]+)\}/g)) {
		for (const part of match[1]!.split(',')) {
			const name = part
				.trim()
				.split(/\s+as\s+/i)
				.pop()
				?.trim();
			if (name && /^[A-Z][A-Za-z0-9]*$/.test(name)) exports.add(name);
		}
	}
	return exports;
}

function uniqueSorted(values: readonly string[]): string[] {
	return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function collectLogPaths(logDir: string): Record<string, string> {
	const always = ['result.json', 'analysis.json'];
	const known = [
		'scaffold.log',
		'feedback-server.log',
		'codex-transcript.jsonl',
		'codex-last-message.txt',
		'build.log',
		'dev-server.log'
	];
	const logs: Record<string, string> = {};
	for (const file of always) {
		logs[file.replace(/\W+/g, '_').replace(/_$/, '')] = resolve(logDir, file);
	}
	for (const file of known) {
		const path = resolve(logDir, file);
		if (existsSync(path)) logs[file.replace(/\W+/g, '_').replace(/_$/, '')] = path;
	}
	const screenshotDir = resolve(logDir, 'screenshots');
	if (existsSync(screenshotDir)) logs.screenshots = screenshotDir;
	const feedbackCodexDir = resolve(logDir, 'feedback-codex');
	if (existsSync(feedbackCodexDir)) logs.feedback_codex = feedbackCodexDir;
	return logs;
}

function relativeToLogDir(absPath: string, logDir: string): string {
	const prefix = logDir.endsWith('/') ? logDir : logDir + '/';
	return absPath.startsWith(prefix) ? absPath.slice(prefix.length) : absPath;
}

export function formatScenarioResult(result: ScenarioResult): string {
	const lines: string[] = [];
	const displayName = result.runLabel ? `${result.name} / ${result.runLabel}` : result.name;
	lines.push(`${result.ok ? 'PASS' : 'FAIL'}  ${displayName}`);
	for (const p of result.phases) {
		const flag = p.ok ? '✓' : '✗';
		const duration = `${(p.durationMs / 1000).toFixed(1)}s`.padStart(6);
		const suffix = p.note ? ` — ${p.note}` : '';
		lines.push(`  ${flag} ${p.name.padEnd(22)} ${duration}${suffix}`);
	}
	lines.push(`  project: ${result.projectDir}`);
	lines.push(`  logs:    ${result.logDir}`);
	if (result.devServer) {
		lines.push(`  dev:     ${result.devServer.url}  (pid ${result.devServer.pid} — kill manually)`);
	}
	if (result.screenshots.length > 0) {
		lines.push(`  shots:   ${result.screenshots.map((s) => s.label).join(', ')}`);
	}
	if (result.codex) {
		lines.push('  agent:');
		for (const line of summarizeCodexRun(result.codex).split('\n')) {
			lines.push(`    ${line.trimStart()}`);
		}
	}
	return lines.join('\n');
}
