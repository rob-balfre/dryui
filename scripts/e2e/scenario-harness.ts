/**
 * Runs one E2E scenario: scaffold a fresh DryUI project from the current
 * worktree, exercise the feedback UE, let Codex make changes, then verify
 * the result builds and serves the expected content.
 *
 * Each scenario claims its own ports and temp project dir so multiple can run
 * in parallel (subject to Codex subscription concurrency).
 */

import { execFileSync, spawn, type ChildProcess } from 'node:child_process';
import {
	closeSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	openSync,
	readFileSync,
	writeFileSync
} from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { killOwnedProcess, waitForUrl } from '../../packages/cli/src/commands/launch-utils.ts';
import { runCodexExec, summarizeCodexRun, type CodexRunResult } from './codex-runner.ts';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..', '..');
const cliBin = resolve(repoRoot, 'packages/cli/dist/index.js');
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
	readonly assertions: readonly ScenarioAssertion[];
	readonly codexTimeoutMs?: number;
	readonly codexModel?: string;
}

export type ScenarioAssertion =
	| { kind: 'file-exists'; path: string }
	| { kind: 'file-contains'; path: string; needle: string }
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
}

export interface RunScenarioOptions {
	readonly tarballsDir?: string;
	readonly keepProject?: boolean;
	readonly verbose?: boolean;
	readonly streamCodex?: boolean;
	readonly codexStreamRaw?: boolean;
	readonly useUserCodexConfig?: boolean;
	readonly useLocalDryuiPlugin?: boolean;
	readonly codexTimeoutMs?: number;
}

const RESULT_SCHEMA_VERSION = 1;

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

function createLogDir(name: string): string {
	const dir = resolve(repoRoot, 'reports/e2e-runs', `${name}-${Date.now()}`);
	mkdirSync(dir, { recursive: true });
	return dir;
}

function createProjectDir(name: string): string {
	return mkdtempSync(resolve(tmpdir(), `dryui-e2e-${name}-`));
}

function scaffold(projectDir: string, tarballsDir: string, logDir: string): void {
	const logPath = resolve(logDir, 'scaffold.log');
	const args = [
		cliBin,
		'init',
		projectDir,
		'--pm',
		'bun',
		'--no-launch',
		'--dev-tarballs',
		tarballsDir
	];
	const output = execFileSync('node', args, {
		cwd: repoRoot,
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe']
	});
	writeFileSync(logPath, output);
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

async function postSyntheticFeedback(port: number, prompt: string): Promise<{ id: string }> {
	const body = {
		url: `http://127.0.0.1:${port}/synthetic-e2e`,
		image: { webp: BLANK_WEBP_BASE64, png: BLANK_PNG_BASE64 },
		viewport: { width: 1280, height: 800 },
		scroll: { x: 0, y: 0 },
		drawings: [
			{
				kind: 'text',
				x: 40,
				y: 40,
				value: prompt
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

async function runAssertions(
	projectDir: string,
	logDir: string,
	devUrlBase: string,
	assertions: readonly ScenarioAssertion[]
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
			// Force a real navigation so `emulateMedia` changes are applied — the
			// `visit()` cache would short-circuit and give us a light-mode snap
			// under a dark backdrop.
			await page.goto(devUrlBase + pathname, { waitUntil: 'networkidle', timeout: 30_000 });
			const filePath = resolve(screenshotDir, `${label}.png`);
			await page.screenshot({ path: filePath, fullPage: false });
			screenshots.push({ label, path: filePath, url: devUrlBase + pathname });
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

function killChild(child: ChildProcess | null): void {
	if (child?.pid) killOwnedProcess(child.pid);
}

function describeCodexLine(line: string): string | null {
	const trimmed = line.trim();
	if (!trimmed) return null;
	try {
		const event = JSON.parse(trimmed) as {
			type?: string;
			item?: { type?: string; title?: string; status?: string; text?: string };
		};
		if (!event.type) return null;
		if (event.type === 'turn.started' || event.type === 'turn.completed') return event.type;
		if (event.type === 'item.started' || event.type === 'item.completed') {
			const itemType = event.item?.type ? ` ${event.item.type}` : '';
			const status = event.item?.status ? ` ${event.item.status}` : '';
			const title = event.item?.title ? `: ${event.item.title}` : '';
			return `${event.type}${itemType}${status}${title}`;
		}
		if (event.type === 'error') return 'error';
		return null;
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
		const text =
			contentText(event.content) ??
			firstString(event, ['text', 'message', 'delta', 'output', 'error', 'error_message']);
		return text ? `${type}: ${compactText(text)}` : type;
	} catch {
		return compactText(trimmed);
	}
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

	const projectDir = createProjectDir(scenario.name);
	const logDir = createLogDir(scenario.name);
	const phases: ScenarioPhase[] = [];
	let codex: CodexRunResult | null = null;
	let feedbackChild: ChildProcess | null = null;
	let devChild: ChildProcess | null = null;
	let screenshots: ScenarioScreenshot[] = [];
	let assertionFailures: string[] = [];
	const startedAt = new Date().toISOString();
	const [feedbackPort, devPort] = await Promise.all([getFreePort(), getFreePort()]);

	const log = (msg: string) => {
		if (options.verbose) console.log(`[${scenario.name}] ${msg}`);
	};
	const progress = (msg: string) => {
		console.log(`[${scenario.name}] ${msg}`);
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

		const pFeedbackUp = phase('feedback-up');
		phases.push(pFeedbackUp);
		feedbackChild = await runPhase(pFeedbackUp, async () => {
			return await startFeedbackServer(projectDir, logDir, feedbackPort);
		});
		if (!pFeedbackUp.ok) return finalize(false);

		const pSubmission = phase('feedback-submission');
		phases.push(pSubmission);
		await runPhase(pSubmission, async () => {
			const submission = await postSyntheticFeedback(feedbackPort, scenario.prompt);
			await assertPendingSubmission(feedbackPort, submission.id);
			pSubmission.note = `id=${submission.id}`;
		});
		killChild(feedbackChild);
		feedbackChild = null;

		if (!pSubmission.ok) return finalize(false);

		const pCodex = phase('codex');
		phases.push(pCodex);
		codex = await runPhase(pCodex, async () => {
			let lastCodexEvent = 'starting';
			const started = Date.now();
			const codexTimeoutMs = options.codexTimeoutMs ?? scenario.codexTimeoutMs;
			const streamCodex = options.streamCodex === true;
			const streamRawCodex = options.codexStreamRaw === true || options.verbose === true;
			if (options.useUserCodexConfig === true) {
				progress('codex config: user ~/.codex');
			} else if (options.useLocalDryuiPlugin !== false) {
				progress('codex config: local packages/plugin');
			} else {
				progress('codex config: isolated without plugins');
			}
			const heartbeat = setInterval(() => {
				progress(
					`codex still running (${((Date.now() - started) / 1000).toFixed(0)}s): ${lastCodexEvent}`
				);
			}, CODEX_HEARTBEAT_MS);
			heartbeat.unref();
			try {
				const result = await runCodexExec({
					projectDir,
					prompt: scenario.prompt,
					logDir,
					...(scenario.codexModel ? { model: scenario.codexModel } : {}),
					...(codexTimeoutMs !== undefined ? { timeoutMs: codexTimeoutMs } : {}),
					useUserConfig: options.useUserCodexConfig === true,
					useLocalDryuiPlugin: options.useLocalDryuiPlugin !== false,
					onStdoutLine: (line) => {
						const description = describeCodexLine(line);
						if (description) lastCodexEvent = description;
						if (streamRawCodex) {
							console.log(`[${scenario.name}] codex json: ${line}`);
						} else if (streamCodex) {
							const formatted = formatCodexStreamLine(line);
							if (formatted) console.log(`[${scenario.name}] codex ${formatted}`);
						}
					},
					onStderrLine: (line) => {
						lastCodexEvent = line;
						if (line.trim() === CODEX_STDIN_NOTICE) {
							if (streamCodex || streamRawCodex || options.verbose) {
								console.log(`[${scenario.name}] codex info: ${line}`);
							}
							return;
						}
						console.error(`[${scenario.name}] codex stderr: ${line}`);
					}
				});
				if (!result.ok) {
					throw new Error(`codex exec failed\n${summarizeCodexRun(result)}`);
				}
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
		const result: ScenarioResult = {
			name: scenario.name,
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
		writeResultJson(result);
		return result;
	}
}

function writeResultJson(result: ScenarioResult): void {
	const payload = {
		schemaVersion: RESULT_SCHEMA_VERSION,
		name: result.name,
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
		assertionFailures: result.assertionFailures
	};
	writeFileSync(resolve(result.logDir, 'result.json'), JSON.stringify(payload, null, 2) + '\n');
}

function extractCodexTokens(codex: CodexRunResult): {
	input: number | null;
	cached: number | null;
	output: number | null;
} {
	const turnCompleted = [...codex.events].reverse().find((e) => e.type === 'turn.completed');
	if (!turnCompleted || typeof turnCompleted.usage !== 'object' || turnCompleted.usage === null) {
		return { input: null, cached: null, output: null };
	}
	const usage = turnCompleted.usage as Record<string, unknown>;
	return {
		input: typeof usage.input_tokens === 'number' ? usage.input_tokens : null,
		cached: typeof usage.cached_input_tokens === 'number' ? usage.cached_input_tokens : null,
		output: typeof usage.output_tokens === 'number' ? usage.output_tokens : null
	};
}

function relativeToLogDir(absPath: string, logDir: string): string {
	const prefix = logDir.endsWith('/') ? logDir : logDir + '/';
	return absPath.startsWith(prefix) ? absPath.slice(prefix.length) : absPath;
}

export function formatScenarioResult(result: ScenarioResult): string {
	const lines: string[] = [];
	lines.push(`${result.ok ? 'PASS' : 'FAIL'}  ${result.name}`);
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
		lines.push('  codex:');
		for (const line of summarizeCodexRun(result.codex).split('\n')) {
			lines.push(`    ${line.trimStart()}`);
		}
	}
	return lines.join('\n');
}
