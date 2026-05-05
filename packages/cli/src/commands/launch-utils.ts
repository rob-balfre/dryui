import { createHash } from 'node:crypto';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import {
	closeSync,
	copyFileSync,
	existsSync,
	mkdirSync,
	openSync,
	readFileSync,
	readdirSync,
	statSync,
	writeFileSync
} from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { DEFAULT_FEEDBACK_HOST, DEFAULT_FEEDBACK_PORT } from '@dryui/feedback-server';
import { isStaleDryuiClaudeAgentFile } from '@dryui/mcp/agent-drift';

export const FEEDBACK_SERVER_URL = `http://${DEFAULT_FEEDBACK_HOST}:${DEFAULT_FEEDBACK_PORT}`;
export type DryuiPackageManager = 'bun' | 'pnpm' | 'npm' | 'yarn' | 'unknown';

const require = createRequire(import.meta.url);

export interface FeedbackServerEntryOptions {
	workspaceRoot?: string;
	preferPackaged?: boolean;
}

export function isDryuiDevMode(): boolean {
	const flag = process.env['DRYUI_DEV'];
	return flag === '1' || flag === 'true';
}

const DRYUI_DEV_LINKABLE_PACKAGES = [
	'@dryui/ui',
	'@dryui/primitives',
	'@dryui/feedback',
	'@dryui/lint'
] as const;

export interface SwapTarballOverridesResult {
	readonly swapped: readonly string[];
	readonly already: readonly string[];
}

const TARBALL_OVERRIDE_RE = /\.tgz$/i;

function isTarballSpecifier(value: unknown): value is string {
	return typeof value === 'string' && TARBALL_OVERRIDE_RE.test(value);
}

function rewriteOverrideMap(
	map: Record<string, unknown> | undefined,
	packages: readonly string[],
	out: { swapped: Set<string>; already: Set<string> }
): boolean {
	if (!map) return false;
	let mutated = false;
	for (const name of packages) {
		const value = map[name];
		if (value === undefined) continue;
		const linkSpec = `link:${name}`;
		if (value === linkSpec) {
			out.already.add(name);
			continue;
		}
		if (!isTarballSpecifier(value)) continue;
		map[name] = linkSpec;
		out.swapped.add(name);
		mutated = true;
	}
	return mutated;
}

/**
 * In `DRYUI_DEV=1` flows, the consumer's package.json may pin DryUI packages
 * to a local tarball (`/path/dryui-ui-2.0.2.tgz`) under `overrides`/
 * `resolutions`/`pnpm.overrides`. The override wins over `bun link`, so the
 * project keeps installing a frozen tarball even after the workspace has
 * registered the package. Rewriting these specifiers to `link:<pkg>` lets the
 * package manager pull the workspace symlink for live source iteration.
 *
 * Returns the packages whose specifier changed (so the caller can run a
 * single `bun install` afterward) plus the ones that were already linked.
 */
export function swapDryuiTarballOverridesToLinks(
	cwd: string,
	packages: readonly string[] = DRYUI_DEV_LINKABLE_PACKAGES
): SwapTarballOverridesResult {
	const pkgPath = resolve(cwd, 'package.json');
	let raw: string;
	try {
		raw = readFileSync(pkgPath, 'utf-8');
	} catch {
		return { swapped: [], already: [] };
	}

	let pkg: Record<string, unknown>;
	try {
		pkg = JSON.parse(raw) as Record<string, unknown>;
	} catch {
		return { swapped: [], already: [] };
	}

	const tracker = { swapped: new Set<string>(), already: new Set<string>() };
	let mutated = false;
	mutated =
		rewriteOverrideMap(pkg['overrides'] as Record<string, unknown>, packages, tracker) || mutated;
	mutated =
		rewriteOverrideMap(pkg['resolutions'] as Record<string, unknown>, packages, tracker) || mutated;
	const pnpm = pkg['pnpm'] as { overrides?: Record<string, unknown> } | undefined;
	mutated = rewriteOverrideMap(pnpm?.overrides, packages, tracker) || mutated;

	if (mutated) {
		const trailing = raw.endsWith('\n') ? '\n' : '';
		writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}${trailing}`, 'utf-8');
	}

	return {
		swapped: [...tracker.swapped],
		already: [...tracker.already]
	};
}

export const DRYUI_DEV_LINKABLE_PACKAGE_NAMES = DRYUI_DEV_LINKABLE_PACKAGES;

export function resolveFeedbackServerEntry(options: FeedbackServerEntryOptions = {}): string {
	const { workspaceRoot, preferPackaged = false } = options;
	const workspaceDistPath = workspaceRoot
		? resolve(workspaceRoot, 'packages/feedback-server/dist/server.js')
		: null;
	const workspaceSrcPath = workspaceRoot
		? resolve(workspaceRoot, 'packages/feedback-server/src/server.ts')
		: null;

	// DRYUI_DEV=1 forces source-of-truth from packages/feedback-server/src so the
	// CLI spawns the live TypeScript entry instead of whatever dist/ is currently
	// on disk. Falls through if src isn't reachable (e.g. running from a published
	// install that doesn't ship src).
	if (isDryuiDevMode() && workspaceSrcPath && existsSync(workspaceSrcPath)) {
		return workspaceSrcPath;
	}

	if (preferPackaged) {
		try {
			return require.resolve('@dryui/feedback-server/server');
		} catch {
			// fall through to workspace paths
		}
	}

	if (workspaceDistPath && existsSync(workspaceDistPath)) return workspaceDistPath;
	if (workspaceSrcPath && existsSync(workspaceSrcPath)) return workspaceSrcPath;

	try {
		return require.resolve('@dryui/feedback-server/server');
	} catch {
		// Final fallback: workspace src path even if it doesn't exist (for clearer error downstream).
		return workspaceSrcPath ?? '@dryui/feedback-server/server';
	}
}

export interface SpawnFeedbackServerOptions {
	entry: string;
	cwd?: string;
	host?: string;
	port?: number;
	db?: string;
	project?: string;
}

export interface SpawnedProcess {
	pid: number;
}

export function spawnFeedbackServerInBackground(
	options: SpawnFeedbackServerOptions
): SpawnedProcess | null {
	const args = ['run', options.entry];
	if (options.port !== undefined) args.push('--port', String(options.port));
	if (options.host) args.push('--host', options.host);
	if (options.db) args.push('--db', options.db);
	if (options.project) args.push('--project', options.project);

	const child = spawn('bun', args, {
		...(options.cwd ? { cwd: options.cwd } : {}),
		detached: true,
		stdio: 'ignore'
	});
	child.unref();
	return child.pid !== undefined ? { pid: child.pid } : null;
}

/**
 * Send SIGTERM to a process we started via `spawn(..., { detached: true })`.
 * Addresses the process group first (negative pid) so child workers die too;
 * falls back to a single-pid signal if the group signal fails.
 */
export function killOwnedProcess(pid: number): void {
	try {
		process.kill(-pid, 'SIGTERM');
		return;
	} catch {}
	try {
		process.kill(pid, 'SIGTERM');
	} catch {}
}

export function openBrowser(url: string): boolean {
	try {
		if (process.platform === 'darwin') {
			const child = spawn('open', [url], { detached: true, stdio: 'ignore' });
			child.unref();
			return true;
		}

		if (process.platform === 'win32') {
			const child = spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' });
			child.unref();
			return true;
		}

		const child = spawn('xdg-open', [url], { detached: true, stdio: 'ignore' });
		child.unref();
		return true;
	} catch {
		return false;
	}
}

export function isHealthyProbeStatus(status: number): boolean {
	return status >= 200 && status < 300;
}

export interface UrlProbeResult {
	readonly ok: boolean;
	readonly status?: number;
	readonly errorSummary?: string;
	readonly transportError?: string;
}

export async function probeUrl(url: string, timeoutMs = 1_500): Promise<UrlProbeResult> {
	try {
		const response = await fetch(url, {
			redirect: 'manual',
			signal: AbortSignal.timeout(timeoutMs)
		});
		if (isHealthyProbeStatus(response.status)) {
			return { ok: true, status: response.status };
		}
		let errorSummary: string | undefined;
		if (response.status >= 500) {
			try {
				errorSummary = extractDevServerErrorSummary(await response.text());
			} catch {}
		}
		return { ok: false, status: response.status, ...(errorSummary ? { errorSummary } : {}) };
	} catch (err) {
		return { ok: false, transportError: err instanceof Error ? err.message : String(err) };
	}
}

export async function urlResponds(url: string, timeoutMs = 1_500): Promise<boolean> {
	return (await probeUrl(url, timeoutMs)).ok;
}

export async function waitForUrl(url: string, timeoutMs = 15_000): Promise<boolean> {
	return (await waitForUrlDetailed(url, timeoutMs)).ok;
}

export async function waitForUrlDetailed(url: string, timeoutMs = 15_000): Promise<UrlProbeResult> {
	const startedAt = Date.now();
	let last: UrlProbeResult = { ok: false };

	while (Date.now() - startedAt < timeoutMs) {
		last = await probeUrl(url);
		if (last.ok) return last;

		await new Promise((resolve) => setTimeout(resolve, 250));
	}

	return last;
}

export interface EnsureUrlReadyResult {
	message: string;
	ownedPid: number | null;
}

export async function ensureUrlReady(
	url: string,
	start: () => SpawnedProcess | null,
	failureMessage: string,
	timeoutMs?: number
): Promise<EnsureUrlReadyResult> {
	if (await urlResponds(url)) {
		return { message: 'already running', ownedPid: null };
	}

	const spawned = start();

	if (await waitForUrl(url, timeoutMs)) {
		return { message: 'started in the background', ownedPid: spawned?.pid ?? null };
	}

	throw new Error(failureMessage);
}

export function extractDevServerErrorSummary(body: string): string | undefined {
	if (!body) return undefined;
	const preMatches = body.match(/<pre[^>]*>([\s\S]*?)<\/pre>/gi);
	let candidate = '';
	if (preMatches && preMatches.length > 0) {
		candidate = preMatches.map((block) => block.replace(/<pre[^>]*>|<\/pre>/gi, '')).join('\n');
	} else {
		candidate = body.replace(/<[^>]+>/g, ' ');
	}
	const decoded = candidate
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/\r/g, '')
		.trim();
	if (!decoded) return undefined;
	const firstMeaningful = decoded
		.split('\n')
		.map((line) => line.trim())
		// Vite's SSR 500 page prefixes the real error with a generic "Internal Error" heading.
		.find((line) => line.length > 0 && line !== 'Internal Error');
	if (!firstMeaningful) return undefined;
	return firstMeaningful.length > 500 ? `${firstMeaningful.slice(0, 500)}…` : firstMeaningful;
}

export interface PortHolder {
	pid: number;
	command: string;
	cwd?: string;
}

function readProcessCwd(pid: number): string | undefined {
	try {
		const output = execFileSync('lsof', ['-a', '-p', String(pid), '-d', 'cwd', '-Fn'], {
			stdio: ['ignore', 'pipe', 'ignore'],
			encoding: 'utf8'
		});
		const cwdLine = output.split('\n').find((line) => line.startsWith('n') && line.length > 1);
		return cwdLine ? cwdLine.slice(1) : undefined;
	} catch {
		return undefined;
	}
}

export function findPortHolder(port: number): PortHolder | null {
	if (process.platform === 'win32') return null;

	let pidOutput: string;
	try {
		pidOutput = execFileSync('lsof', [`-ti:${port}`, '-sTCP:LISTEN'], {
			stdio: ['ignore', 'pipe', 'ignore'],
			encoding: 'utf8'
		}).trim();
	} catch {
		return null;
	}
	if (!pidOutput) return null;

	const firstLine = pidOutput.split('\n')[0];
	if (!firstLine) return null;
	const pid = Number.parseInt(firstLine, 10);
	if (!Number.isFinite(pid) || pid <= 0) return null;

	let command = 'unknown';
	try {
		const commOutput = execFileSync('ps', ['-p', String(pid), '-o', 'comm='], {
			stdio: ['ignore', 'pipe', 'ignore'],
			encoding: 'utf8'
		}).trim();
		if (commOutput) {
			const basename = commOutput.split('/').pop();
			command = basename || commOutput;
		}
	} catch {}

	const cwd = readProcessCwd(pid);
	return { pid, command, ...(cwd ? { cwd } : {}) };
}

export function killPortHolder(pid: number): boolean {
	try {
		process.kill(pid, 'SIGTERM');
		return true;
	} catch {
		return false;
	}
}

export function readProjectDevScript(root: string): string | null {
	try {
		const raw = readFileSync(resolve(root, 'package.json'), 'utf8');
		const pkg = JSON.parse(raw) as { scripts?: Record<string, string> };
		return pkg.scripts?.dev ?? null;
	} catch {
		return null;
	}
}

export function projectHasDependency(root: string, name: string): boolean {
	try {
		const raw = readFileSync(resolve(root, 'package.json'), 'utf8');
		const pkg = JSON.parse(raw) as {
			dependencies?: Record<string, string>;
			devDependencies?: Record<string, string>;
			peerDependencies?: Record<string, string>;
			optionalDependencies?: Record<string, string>;
		};
		return Boolean(
			pkg.dependencies?.[name] ??
			pkg.devDependencies?.[name] ??
			pkg.peerDependencies?.[name] ??
			pkg.optionalDependencies?.[name]
		);
	} catch {
		return false;
	}
}

export function projectDevLogPath(root: string): string {
	const hash = createHash('sha1').update(resolve(root)).digest('hex').slice(0, 12);
	return resolve(tmpdir(), `dryui-dev-${hash}.log`);
}

function openProjectDevLog(logPath: string): number | null {
	try {
		mkdirSync(dirname(logPath), { recursive: true });
		return openSync(logPath, 'w');
	} catch {
		return null;
	}
}

export function readProjectDevLogTail(logPath: string, maxLines = 40): string[] {
	try {
		const raw = readFileSync(logPath, 'utf-8');
		if (!raw) return [];
		const lines = raw
			.split('\n')
			// biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI escape strip is intentional
			.map((line) => line.replace(/\x1b\[[0-9;]*m/g, '').trimEnd())
			.filter((line) => line.length > 0);
		return lines.slice(-maxLines);
	} catch {
		return [];
	}
}

export interface SpawnProjectDevServerOptions {
	root: string;
	packageManager: DryuiPackageManager;
	host: string;
	port: number;
	logPath?: string;
}

export function spawnProjectDevServerInBackground(
	options: SpawnProjectDevServerOptions
): SpawnedProcess | null {
	const pm = options.packageManager === 'unknown' ? 'npm' : options.packageManager;
	const args = ['run', 'dev', '--', '--host', options.host, '--port', String(options.port)];
	const logFd = options.logPath ? openProjectDevLog(options.logPath) : null;
	const stdio: ['ignore', 'ignore' | number, 'ignore' | number] =
		logFd !== null ? ['ignore', logFd, logFd] : ['ignore', 'ignore', 'ignore'];
	const child = spawn(pm, args, {
		cwd: options.root,
		detached: true,
		stdio
	});
	child.unref();
	if (logFd !== null) closeSync(logFd);
	return child.pid !== undefined ? { pid: child.pid } : null;
}

export interface InstallPackageOptions {
	cwd: string;
	packageManager: Exclude<DryuiPackageManager, 'unknown'>;
	packageNames: string[];
}

export function installPackage(options: InstallPackageOptions): boolean {
	if (options.packageNames.length === 0) return true;
	const result = spawnSync(options.packageManager, ['add', ...options.packageNames], {
		cwd: options.cwd,
		stdio: 'inherit'
	});
	return result.status === 0;
}

export interface RunPackageManagerInstallOptions {
	cwd: string;
	packageManager: Exclude<DryuiPackageManager, 'unknown'>;
}

/** Runs a no-arg `<pm> install` so package.json edits (overrides, deps) are applied. */
export function runPackageManagerInstall(options: RunPackageManagerInstallOptions): boolean {
	const result = spawnSync(options.packageManager, ['install'], {
		cwd: options.cwd,
		stdio: 'inherit'
	});
	return result.status === 0;
}

export interface LinkPackageOptions {
	cwd: string;
	packageManager: Exclude<DryuiPackageManager, 'unknown'>;
	packageNames: string[];
}

export function linkPackage(options: LinkPackageOptions): boolean {
	if (options.packageNames.length === 0) return true;
	for (const name of options.packageNames) {
		const result = spawnSync(options.packageManager, ['link', name], {
			cwd: options.cwd,
			stdio: 'inherit'
		});
		if (result.status !== 0) return false;
	}
	return true;
}

export interface MountFeedbackOptions {
	layoutPath: string;
	serverUrl: string;
}

const FEEDBACK_IMPORT_STATEMENT = "import { Feedback } from '@dryui/feedback';";

function injectFeedbackImport(content: string): string {
	const scriptOpen = content.match(/<script[^>]*>/);
	if (scriptOpen) {
		const insertPos = (scriptOpen.index ?? 0) + scriptOpen[0].length;
		return (
			content.slice(0, insertPos) + `\n\t${FEEDBACK_IMPORT_STATEMENT}` + content.slice(insertPos)
		);
	}
	return `<script lang="ts">\n\t${FEEDBACK_IMPORT_STATEMENT}\n</script>\n\n${content}`;
}

export function mountFeedbackInLayout(options: MountFeedbackOptions): boolean {
	let content: string;
	try {
		content = readFileSync(options.layoutPath, 'utf-8');
	} catch {
		return false;
	}

	if (/from\s+['"]@dryui\/feedback['"]/.test(content)) return true;

	const withImport = injectFeedbackImport(content);
	const feedbackTag = `<Feedback serverUrl="${options.serverUrl}" />`;
	const updated = /<Feedback\b/.test(withImport)
		? withImport
		: `${withImport.replace(/\s*$/, '')}\n\n${feedbackTag}\n`;

	try {
		writeFileSync(options.layoutPath, updated, 'utf-8');
		return true;
	} catch {
		return false;
	}
}

const VITE_CONFIG_CANDIDATES = [
	'vite.config.ts',
	'vite.config.js',
	'vite.config.mts',
	'vite.config.mjs'
];

export function findViteConfig(root: string): string | null {
	for (const name of VITE_CONFIG_CANDIDATES) {
		const candidate = resolve(root, name);
		if (existsSync(candidate)) return candidate;
	}
	return null;
}

// Always wired into the consumer's `ssr.noExternal`. SvelteKit needs Svelte
// component packages bundled into the SSR output rather than imported at
// runtime (the dist code expects to be processed by vite-plugin-svelte).
export const FEEDBACK_SSR_NO_EXTERNAL = [
	'@dryui/ui',
	'@dryui/primitives',
	'@dryui/feedback',
	'lucide-svelte'
] as const;

export function escapeRegExp(input: string): string {
	return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function noExternalContainsPackage(content: string, name: string): boolean {
	const escaped = escapeRegExp(name);
	const pattern = new RegExp(
		`noExternal\\s*:\\s*(?:\\[[\\s\\S]*?['"]${escaped}['"][\\s\\S]*?\\]|['"]${escaped}['"])`
	);
	return pattern.test(content);
}

function missingNoExternalPackages(content: string): string[] {
	return FEEDBACK_SSR_NO_EXTERNAL.filter((name) => !noExternalContainsPackage(content, name));
}

export function viteConfigHasFeedbackNoExternal(configPath: string): boolean {
	try {
		const content = readFileSync(configPath, 'utf-8');
		return missingNoExternalPackages(content).length === 0;
	} catch {
		return false;
	}
}

function renderNoExternalArray(names: readonly string[]): string {
	return `[${names.map((name) => `'${name}'`).join(', ')}]`;
}

function injectIntoExistingNoExternalArray(
	content: string,
	missing: readonly string[]
): string | null {
	const match = content.match(/noExternal\s*:\s*\[([\s\S]*?)\]/);
	if (!match) return null;
	const inner = match[1] ?? '';
	const trimmed = inner.trim();
	const separator = trimmed === '' || trimmed.endsWith(',') ? '' : ', ';
	const additions = missing.map((name) => `'${name}'`).join(', ');
	const replacement = `noExternal: [${inner.replace(/\s*$/, '')}${separator}${additions}]`;
	return content.replace(match[0], replacement);
}

function injectNoExternalIntoSsrBlock(content: string): string | null {
	const match = content.match(/ssr\s*:\s*\{/);
	if (!match) return null;
	const insertPos = (match.index ?? 0) + match[0].length;
	return (
		content.slice(0, insertPos) +
		`\n\t\tnoExternal: ${renderNoExternalArray(FEEDBACK_SSR_NO_EXTERNAL)},` +
		content.slice(insertPos)
	);
}

function injectSsrIntoConfigObject(content: string): string | null {
	const match = content.match(/defineConfig\s*\(\s*\{/) ?? content.match(/export\s+default\s*\{/);
	if (!match) return null;
	const insertPos = (match.index ?? 0) + match[0].length;
	return (
		content.slice(0, insertPos) +
		`\n\tssr: { noExternal: ${renderNoExternalArray(FEEDBACK_SSR_NO_EXTERNAL)} },` +
		content.slice(insertPos)
	);
}

const MINIMAL_VITE_CONFIG = `import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		noExternal: ${renderNoExternalArray(FEEDBACK_SSR_NO_EXTERNAL)}
	}
});
`;

export function patchViteConfigFeedbackNoExternal(configPath: string): boolean {
	let content: string;
	try {
		content = readFileSync(configPath, 'utf-8');
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code !== 'ENOENT') return false;
		try {
			writeFileSync(configPath, MINIMAL_VITE_CONFIG, 'utf-8');
			return true;
		} catch {
			return false;
		}
	}

	const missing = missingNoExternalPackages(content);
	if (missing.length === 0) return true;

	const updated =
		injectIntoExistingNoExternalArray(content, missing) ??
		injectNoExternalIntoSsrBlock(content) ??
		injectSsrIntoConfigObject(content);

	if (!updated) return false;

	try {
		writeFileSync(configPath, updated, 'utf-8');
		return true;
	} catch {
		return false;
	}
}

export interface EnsureClaudeAgentsResult {
	readonly sourceFound: boolean;
	readonly copied: readonly string[];
	readonly updated: readonly string[];
}

export interface EnsureClaudeAgentsOptions {
	readonly force?: boolean;
}

/**
 * Mirror the bundled Claude Code subagents (`feedback`, `dryui-layout`) from
 * `<cli-pkg>/agents/` into `<project>/.claude/agents/`. Idempotent: copies
 * missing files and refreshes ones whose source is newer than the project
 * copy. Existing customised copies (older than the source mtime) are
 * preserved so users who edited their `.claude/agents/feedback.md` aren't
 * silently clobbered — they can `rm` the file to take a re-copy.
 *
 * Why this lives outside `init`: when `--agent feedback` runs in a project
 * that has no `.claude/agents/feedback.md`, the agent's frontmatter
 * (including `permissionMode: auto`) never loads — and the parent CLI's
 * `--permission-mode auto` is silently ignored when `--agent` is set. The
 * launcher calls this on every run so existing projects (where init never
 * had this step) catch up without needing a manual reinit.
 */
export function ensureClaudeAgents(
	projectRoot: string,
	options: EnsureClaudeAgentsOptions = {}
): EnsureClaudeAgentsResult {
	let here: string;
	try {
		here = fileURLToPath(import.meta.url);
	} catch {
		return { sourceFound: false, copied: [], updated: [] };
	}

	// `here` resolves to either `<cli-pkg>/dist/index.js` (bundled) or
	// `<cli-pkg>/src/commands/launch-utils.ts` (source mode). Walk up to the
	// package root in both shapes.
	const distAgents = resolve(dirname(here), '..', 'agents');
	const srcAgents = resolve(dirname(here), '..', '..', 'agents');
	const sourceDir = existsSync(distAgents) ? distAgents : existsSync(srcAgents) ? srcAgents : null;
	if (!sourceDir) return { sourceFound: false, copied: [], updated: [] };

	let entries: string[];
	try {
		entries = readdirSync(sourceDir).filter((name) => name.endsWith('.md'));
	} catch {
		return { sourceFound: false, copied: [], updated: [] };
	}
	if (entries.length === 0) return { sourceFound: true, copied: [], updated: [] };

	const targetDir = resolve(projectRoot, '.claude', 'agents');
	mkdirSync(targetDir, { recursive: true });

	const copied: string[] = [];
	const updated: string[] = [];
	for (const name of entries) {
		const src = resolve(sourceDir, name);
		const dest = resolve(targetDir, name);
		try {
			if (!existsSync(dest)) {
				copyFileSync(src, dest);
				copied.push(name);
				continue;
			}
			const srcStat = statSync(src);
			const destStat = statSync(dest);
			const srcContent = readFileSync(src, 'utf8');
			const destContent = readFileSync(dest, 'utf8');
			if (destContent === srcContent) continue;
			if (
				options.force ||
				isStaleDryuiClaudeAgentFile(name, destContent) ||
				srcStat.mtimeMs > destStat.mtimeMs
			) {
				copyFileSync(src, dest);
				updated.push(name);
			}
		} catch {
			// Best-effort: keep going if a single file copy fails.
		}
	}

	return { sourceFound: true, copied, updated };
}
