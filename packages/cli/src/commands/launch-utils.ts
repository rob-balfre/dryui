import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

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
	failureMessage: string
): Promise<string> {
	if (await urlResponds(url)) {
		return 'already running';
	}

	start();

	if (await waitForUrl(url)) {
		return 'started in the background';
	}

	throw new Error(failureMessage);
}
