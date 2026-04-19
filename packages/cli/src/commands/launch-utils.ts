import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import type { DryuiPackageManager } from '@dryui/mcp/project-planner';

const require = createRequire(import.meta.url);

export interface FeedbackServerEntryOptions {
	workspaceRoot?: string;
	preferPackaged?: boolean;
}

export function resolveFeedbackServerEntry(options: FeedbackServerEntryOptions = {}): string {
	const { workspaceRoot, preferPackaged = false } = options;
	const workspaceDistPath = workspaceRoot
		? resolve(workspaceRoot, 'packages/feedback-server/dist/server.js')
		: null;
	const workspaceSrcPath = workspaceRoot
		? resolve(workspaceRoot, 'packages/feedback-server/src/server.ts')
		: null;

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
}

export function spawnFeedbackServerInBackground(options: SpawnFeedbackServerOptions): void {
	const args = ['run', options.entry];
	if (options.port !== undefined) args.push('--port', String(options.port));
	if (options.host) args.push('--host', options.host);
	if (options.db) args.push('--db', options.db);

	const child = spawn('bun', args, {
		...(options.cwd ? { cwd: options.cwd } : {}),
		detached: true,
		stdio: 'ignore'
	});
	child.unref();
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

export async function urlResponds(url: string, timeoutMs = 1_500): Promise<boolean> {
	try {
		const response = await fetch(url, {
			redirect: 'manual',
			signal: AbortSignal.timeout(timeoutMs)
		});

		return isHealthyProbeStatus(response.status);
	} catch {
		return false;
	}
}

export async function waitForUrl(url: string, timeoutMs = 15_000): Promise<boolean> {
	const startedAt = Date.now();

	while (Date.now() - startedAt < timeoutMs) {
		if (await urlResponds(url)) {
			return true;
		}

		await new Promise((resolve) => setTimeout(resolve, 250));
	}

	return false;
}

export async function ensureUrlReady(
	url: string,
	start: () => void,
	failureMessage: string,
	timeoutMs?: number
): Promise<string> {
	if (await urlResponds(url)) {
		return 'already running';
	}

	start();

	if (await waitForUrl(url, timeoutMs)) {
		return 'started in the background';
	}

	throw new Error(failureMessage);
}

export interface PortHolder {
	pid: number;
	command: string;
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

	return { pid, command };
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
	const pkgJsonPath = resolve(root, 'package.json');
	if (!existsSync(pkgJsonPath)) return null;
	try {
		const raw = readFileSync(pkgJsonPath, 'utf8');
		const pkg = JSON.parse(raw) as { scripts?: Record<string, string> };
		return pkg.scripts?.dev ?? null;
	} catch {
		return null;
	}
}

export interface SpawnProjectDevServerOptions {
	root: string;
	packageManager: DryuiPackageManager;
	host: string;
	port: number;
}

export function spawnProjectDevServerInBackground(options: SpawnProjectDevServerOptions): void {
	const pm = options.packageManager === 'unknown' ? 'npm' : options.packageManager;
	const args = ['run', 'dev', '--', '--host', options.host, '--port', String(options.port)];
	const child = spawn(pm, args, {
		cwd: options.root,
		detached: true,
		stdio: 'ignore'
	});
	child.unref();
}

export interface InstallPackageOptions {
	cwd: string;
	packageManager: Exclude<DryuiPackageManager, 'unknown'>;
	packageName: string;
}

export function installPackage(options: InstallPackageOptions): boolean {
	const result = spawnSync(options.packageManager, ['add', options.packageName], {
		cwd: options.cwd,
		stdio: 'inherit'
	});
	return result.status === 0;
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

const FEEDBACK_NO_EXTERNAL_PATTERN =
	/noExternal\s*:\s*(?:\[[\s\S]*?['"]@dryui\/feedback['"][\s\S]*?\]|['"]@dryui\/feedback['"])/;

export function viteConfigHasFeedbackNoExternal(configPath: string): boolean {
	try {
		return FEEDBACK_NO_EXTERNAL_PATTERN.test(readFileSync(configPath, 'utf-8'));
	} catch {
		return false;
	}
}

function injectIntoExistingNoExternalArray(content: string): string | null {
	const match = content.match(/noExternal\s*:\s*\[([\s\S]*?)\]/);
	if (!match) return null;
	const inner = match[1] ?? '';
	const trimmed = inner.trim();
	const separator = trimmed === '' || trimmed.endsWith(',') ? '' : ', ';
	const replacement = `noExternal: [${inner.replace(/\s*$/, '')}${separator}'@dryui/feedback']`;
	return content.replace(match[0], replacement);
}

function injectNoExternalIntoSsrBlock(content: string): string | null {
	const match = content.match(/ssr\s*:\s*\{/);
	if (!match) return null;
	const insertPos = (match.index ?? 0) + match[0].length;
	return (
		content.slice(0, insertPos) +
		`\n\t\tnoExternal: ['@dryui/feedback'],` +
		content.slice(insertPos)
	);
}

function injectSsrIntoConfigObject(content: string): string | null {
	const match = content.match(/defineConfig\s*\(\s*\{/) ?? content.match(/export\s+default\s*\{/);
	if (!match) return null;
	const insertPos = (match.index ?? 0) + match[0].length;
	return (
		content.slice(0, insertPos) +
		`\n\tssr: { noExternal: ['@dryui/feedback'] },` +
		content.slice(insertPos)
	);
}

export function patchViteConfigFeedbackNoExternal(configPath: string): boolean {
	let content: string;
	try {
		content = readFileSync(configPath, 'utf-8');
	} catch {
		return false;
	}

	if (FEEDBACK_NO_EXTERNAL_PATTERN.test(content)) return true;

	const updated =
		injectIntoExistingNoExternalArray(content) ??
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
