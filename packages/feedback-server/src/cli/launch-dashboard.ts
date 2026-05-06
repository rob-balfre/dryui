import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

export interface FeedbackServerEntryOptions {
	workspaceRoot?: string;
	preferPackaged?: boolean;
}

function isDryuiDevMode(): boolean {
	const flag = process.env['DRYUI_DEV'];
	return flag === '1' || flag === 'true';
}

/**
 * Find the absolute path to feedback-server's runnable entry. Honours
 * DRYUI_DEV=1 (forces src/server.ts) and falls back from packaged resolve to
 * workspace dist to workspace src in that order.
 */
export function resolveFeedbackServerEntry(options: FeedbackServerEntryOptions = {}): string {
	const { workspaceRoot, preferPackaged = false } = options;
	const workspaceDistPath = workspaceRoot
		? resolve(workspaceRoot, 'packages/feedback-server/dist/server.js')
		: null;
	const workspaceSrcPath = workspaceRoot
		? resolve(workspaceRoot, 'packages/feedback-server/src/server.ts')
		: null;

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

export async function urlResponds(url: string, timeoutMs = 1_500): Promise<boolean> {
	try {
		const response = await fetch(url, {
			redirect: 'manual',
			signal: AbortSignal.timeout(timeoutMs)
		});
		return response.status >= 200 && response.status < 300;
	} catch {
		return false;
	}
}

export async function waitForUrl(url: string, timeoutMs = 15_000): Promise<boolean> {
	const startedAt = Date.now();
	while (Date.now() - startedAt < timeoutMs) {
		if (await urlResponds(url)) return true;
		await new Promise((sleep) => setTimeout(sleep, 250));
	}
	return false;
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

/**
 * Locate the workspace root by walking up from this module looking for a
 * pnpm-workspace.yaml or .git boundary. Returns null when the bin runs from a
 * published install instead of inside the dryui repo.
 */
export function findWorkspaceRoot(startDir?: string): string | null {
	const moduleDir = startDir ?? dirname(fileURLToPath(import.meta.url));
	let current = resolve(moduleDir);
	while (true) {
		if (existsSync(resolve(current, 'pnpm-workspace.yaml'))) return current;
		if (existsSync(resolve(current, '.git'))) return current;
		const parent = dirname(current);
		if (parent === current) return null;
		current = parent;
	}
}

interface BuildWorkspaceResult {
	status: number | null;
	stdout?: string;
	stderr?: string;
}

export interface EnsureFeedbackUiBuiltOptions {
	workspaceRoot?: string;
}

export interface EnsureFeedbackUiBuiltResult {
	ok: boolean;
	message?: string;
}

function hasUiIndex(uiDir: string): boolean {
	return existsSync(resolve(uiDir, 'index.html'));
}

function findWorkspaceUiDir(workspaceRoot: string | undefined): string | null {
	if (!workspaceRoot) return null;
	const packageJsonPath = resolve(workspaceRoot, 'packages/feedback-server/package.json');
	if (!existsSync(packageJsonPath)) return null;
	return resolve(workspaceRoot, 'packages/feedback-server/dist/ui');
}

function findPackagedUiDir(): string | null {
	try {
		const entry = require.resolve('@dryui/feedback-server/server');
		return resolve(dirname(entry), 'ui');
	} catch {
		return null;
	}
}

function buildWorkspaceFeedbackUi(workspaceRoot: string): BuildWorkspaceResult {
	return spawnSync('bun', ['run', '--filter', '@dryui/feedback-server', 'build'], {
		cwd: workspaceRoot,
		encoding: 'utf8'
	});
}

/**
 * Ensure a built dashboard UI exists before launching. Prefers the packaged
 * dist (when this bin runs from a published install), else looks for a
 * workspace dist, else triggers a workspace build. Returns ok=false with a
 * friendly message when neither path can produce index.html.
 */
export function ensureFeedbackUiBuilt(
	options: EnsureFeedbackUiBuiltOptions = {}
): EnsureFeedbackUiBuiltResult {
	const packagedUiDir = findPackagedUiDir();
	if (packagedUiDir && hasUiIndex(packagedUiDir)) return { ok: true };

	const workspaceUiDir = findWorkspaceUiDir(options.workspaceRoot);
	if (workspaceUiDir && hasUiIndex(workspaceUiDir)) return { ok: true };

	if (!options.workspaceRoot || !workspaceUiDir) {
		return {
			ok: false,
			message:
				'Unable to locate a built feedback dashboard. Reinstall @dryui/feedback-server or run its build inside the workspace.'
		};
	}

	const result = buildWorkspaceFeedbackUi(options.workspaceRoot);
	if (result.status === 0 && hasUiIndex(workspaceUiDir)) return { ok: true };

	const detail = [result.stderr, result.stdout]
		.map((value) => value?.trim())
		.find((value) => value && value.length > 0);

	return {
		ok: false,
		message: detail
			? `Unable to build the feedback dashboard.\n\n${detail}`
			: 'Unable to build the feedback dashboard.'
	};
}
