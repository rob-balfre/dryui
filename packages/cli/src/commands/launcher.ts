import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
	DEFAULT_FEEDBACK_HOST,
	DEFAULT_FEEDBACK_PORT,
	normalizeDevUrl,
	projectFeedbackPaths,
	readFeedbackServerConfig,
	toFeedbackBaseUrl
} from '@dryui/feedback-server';
import {
	emitCommandResult,
	emitOrRun,
	hasFlag,
	isInteractiveTTY,
	printCommandHelp,
	type CommandResult
} from '../run.js';
import { ensureFeedbackUiBuilt } from './feedback-ui-build.js';
import {
	ensureUrlReady,
	isHealthyProbeStatus,
	killOwnedProcess as killOwnedProcessDefault,
	openBrowser,
	resolveFeedbackServerEntry,
	spawnFeedbackServerInBackground,
	type SpawnedProcess,
	urlResponds as urlRespondsDefault
} from './launch-utils.js';

export { isHealthyProbeStatus };

const DEFAULT_DOCS_HOST = '127.0.0.1';
const DEFAULT_DOCS_PORT = 5173;

interface EnsureDocsServerResult {
	message: string;
	ownedPid: number | null;
}

interface LauncherRuntime {
	ensureDocsServer: (workspaceRoot: string, docsBaseUrl: string) => Promise<EnsureDocsServerResult>;
	ensureFeedbackServer: (workspaceRoot: string) => Promise<EnsureFeedbackServerResult>;
	ensureFeedbackUiBuilt: (workspaceRoot: string) => CommandResult | null;
	killOwnedProcess: (pid: number) => void;
	isInteractiveTTY: () => boolean;
	now: () => number;
	openBrowser: (url: string) => boolean;
	onProgress: (progress: { workspaceRoot: string; noOpen: boolean }) => void;
}

interface RunLauncherOptions {
	cwd?: string;
	runtime?: Partial<LauncherRuntime>;
	exitOnComplete?: boolean;
}

function launcherHelp(): never {
	printCommandHelp(
		{
			usage: 'dryui [--no-open] [--detach]',
			description: [
				'Open the app in feedback mode for this repository.',
				'The CLI starts the docs app and feedback server when they are not already running.',
				'In an interactive terminal the CLI stays attached until you press Ctrl-C so you can shut the servers down cleanly.',
				'Submitting feedback opens the dashboard in a new tab so you can pick which agent to launch per submission.'
			],
			options: [
				'  --no-open         Print the site and dashboard URLs without opening a browser',
				'  --detach          Spawn servers in the background and exit immediately (old behavior)'
			],
			examples: ['  dryui', '  dryui --no-open', '  dryui --detach']
		},
		0
	);
}

function resolveLauncherWorkspace(root: string): boolean {
	return (
		existsSync(resolve(root, 'apps/docs/package.json')) &&
		existsSync(resolve(root, 'packages/feedback-server/package.json')) &&
		existsSync(resolve(root, 'packages/cli/package.json'))
	);
}

export function findLauncherWorkspaceRoot(start = process.cwd()): string | null {
	let current = resolve(start);

	while (true) {
		if (resolveLauncherWorkspace(current)) {
			return current;
		}

		const parent = dirname(current);
		if (parent === current) {
			return null;
		}

		current = parent;
	}
}

interface LabelledMessage {
	label: string;
	message: string;
}

interface DashboardOutputSections {
	rootLabel: string;
	rootValue: string;
	siteUrl: string | null;
	dashboardUrl: string;
	servers: LabelledMessage[];
	noOpen: boolean;
	opened: boolean;
	notes?: LabelledMessage[];
}

function renderDashboardOutput(sections: DashboardOutputSections): string {
	const browser = sections.noOpen
		? 'skipped (--no-open)'
		: sections.opened
			? 'opening default browser'
			: 'could not auto-open; use the site URL above';

	return [
		'DryUI feedback',
		'',
		`${sections.rootLabel}: ${sections.rootValue}`,
		...(sections.siteUrl ? [`Site: ${sections.siteUrl}`] : []),
		`Dashboard: ${sections.dashboardUrl}`,
		...sections.servers.map(({ label, message }) => `${label}: ${message}`),
		`Browser: ${browser}`,
		...(sections.notes ?? []).map(({ label, message }) => `${label}: ${message}`)
	].join('\n');
}

function emitLauncherError(error: unknown, exitOnComplete: boolean): void {
	if (error instanceof Error && error.message === 'exit') {
		throw error;
	}

	emitCommandResult(
		{
			output: '',
			error: error instanceof Error ? error.message : String(error),
			exitCode: 1
		},
		'toon'
	);

	if (exitOnComplete) {
		process.exit(1);
	}
}

interface ShutdownWaitOptions {
	ownedPids: readonly number[];
	killOwnedProcess: (pid: number) => void;
	input?: ShutdownInput;
}

interface ShutdownInput {
	isTTY?: boolean;
	isRaw?: boolean;
	isPaused?: () => boolean;
	setRawMode?: (mode: boolean) => unknown;
	resume?: () => unknown;
	pause?: () => unknown;
	on: (event: 'data', listener: (chunk: string | Uint8Array) => void) => unknown;
	off: (event: 'data', listener: (chunk: string | Uint8Array) => void) => unknown;
}

function chunkIncludesCtrlC(chunk: string | Uint8Array): boolean {
	if (typeof chunk === 'string') {
		return chunk.includes('\x03');
	}
	return chunk.includes(3);
}

/**
 * Install SIGINT/SIGTERM/SIGHUP handlers that send SIGTERM to the process
 * groups this invocation started, then resolve. The CLI uses this to keep the
 * foreground alive until the user hits Ctrl-C, so servers get a clean shutdown
 * signal instead of being orphaned when the shell exits.
 */
export async function waitForShutdownSignal(options: ShutdownWaitOptions): Promise<void> {
	if (options.ownedPids.length === 0) return;

	await new Promise<void>((resolve) => {
		const keepAlive = setInterval(() => {}, 60_000);
		const input = options.input ?? process.stdin;
		const listenForInput = Boolean(input.isTTY);
		const pauseAfterCleanup = listenForInput && input.isPaused?.() === true;
		let settled = false;
		const setRawModeFalse = (): void => {
			if (!input.isTTY || typeof input.setRawMode !== 'function') return;
			try {
				input.setRawMode(false);
			} catch {
				// Best effort: some harnesses expose a TTY-shaped stdin without raw mode support.
			}
		};
		const handler = (): void => {
			if (settled) return;
			settled = true;
			process.off('SIGINT', handler);
			process.off('SIGTERM', handler);
			process.off('SIGHUP', handler);
			if (listenForInput) {
				input.off('data', onInputData);
				setRawModeFalse();
				if (pauseAfterCleanup) {
					input.pause?.();
				}
			}
			clearInterval(keepAlive);
			console.log('');
			console.log('Stopping servers...');
			for (const pid of options.ownedPids) {
				options.killOwnedProcess(pid);
			}
			resolve();
		};
		const onInputData = (chunk: string | Uint8Array): void => {
			if (chunkIncludesCtrlC(chunk)) {
				handler();
			}
		};
		process.on('SIGINT', handler);
		process.on('SIGTERM', handler);
		process.on('SIGHUP', handler);
		if (listenForInput) {
			setRawModeFalse();
			input.on('data', onInputData);
			input.resume?.();
		}
	});
}

function collectOwnedPids(...pids: ReadonlyArray<number | null | undefined>): number[] {
	const owned: number[] = [];
	for (const pid of pids) {
		if (typeof pid === 'number' && pid > 0) owned.push(pid);
	}
	return owned;
}

interface OwnedPidResult {
	readonly ownedPid: number | null;
}

async function settleOrKillOnRejection<A extends OwnedPidResult, B extends OwnedPidResult>(
	promises: readonly [Promise<A>, Promise<B>],
	killOwnedProcess: (pid: number) => void
): Promise<[A, B]> {
	const settled = await Promise.allSettled(promises);
	const rejected = settled.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
	if (rejected.length > 0) {
		for (const r of settled) {
			if (r.status === 'fulfilled') {
				collectOwnedPids(r.value.ownedPid).forEach(killOwnedProcess);
			}
		}
		throw rejected[0]!.reason;
	}
	return [
		(settled[0] as PromiseFulfilledResult<A>).value,
		(settled[1] as PromiseFulfilledResult<B>).value
	];
}

export function buildDashboardUrl(
	feedbackBaseUrl: string,
	docsBaseUrl: string | null,
	version = Date.now()
): string {
	const dashboardUrl = new URL('/ui/', feedbackBaseUrl);
	dashboardUrl.searchParams.set('v', String(version));

	if (docsBaseUrl) {
		dashboardUrl.searchParams.set(
			'dev',
			normalizeDevUrl(docsBaseUrl, feedbackBaseUrl) ?? docsBaseUrl
		);
	}

	return dashboardUrl.toString();
}

interface EnsureFeedbackServerResult {
	baseUrl: string;
	message: string;
	ownedPid: number | null;
}

async function waitForFeedbackServerConfig(
	projectRoot: string,
	previousUpdatedAt: string | null,
	timeoutMs = 10_000
): Promise<{ baseUrl: string } | null> {
	const startedAt = Date.now();
	while (Date.now() - startedAt < timeoutMs) {
		const config = readFeedbackServerConfig(projectRoot);
		if (config && config.updatedAt !== previousUpdatedAt && config.baseUrl) {
			return { baseUrl: config.baseUrl };
		}
		await new Promise((resolve) => setTimeout(resolve, 150));
	}
	return null;
}

/**
 * Ensure a feedback server is running for `projectRoot`. Uses the project's
 * `.dryui/feedback/server.json` both as the source of truth for where the
 * server should be reachable and as a signal that the server has finished
 * binding (server rewrites it on startup once it picks an actual port).
 */
async function ensureFeedbackServer(
	projectRoot: string,
	options: { workspaceRoot?: string; preferPackaged?: boolean } = {}
): Promise<EnsureFeedbackServerResult> {
	const existingConfig = readFeedbackServerConfig(projectRoot);
	const candidateUrl = existingConfig?.baseUrl
		? existingConfig.baseUrl
		: toFeedbackBaseUrl(DEFAULT_FEEDBACK_HOST, DEFAULT_FEEDBACK_PORT);

	if (await urlRespondsDefault(`${candidateUrl}/health`)) {
		return { baseUrl: candidateUrl, message: 'already running', ownedPid: null };
	}

	const requestedPort = existingConfig?.port ?? DEFAULT_FEEDBACK_PORT;
	const previousUpdatedAt = existingConfig?.updatedAt ?? null;

	const spawned = spawnFeedbackServerInBackground({
		entry: resolveFeedbackServerEntry({
			...(options.workspaceRoot ? { workspaceRoot: options.workspaceRoot } : {}),
			...(options.preferPackaged ? { preferPackaged: true } : {})
		}),
		cwd: projectRoot,
		host: DEFAULT_FEEDBACK_HOST,
		port: requestedPort,
		project: projectRoot
	});

	const ready = await waitForFeedbackServerConfig(projectRoot, previousUpdatedAt);
	if (!ready) {
		throw new Error(
			`Unable to start the feedback server for ${projectRoot}. Check ${projectFeedbackPaths(projectRoot).configPath}.`
		);
	}

	// The server writes server.json after Bun.serve succeeds, so a fresh
	// updatedAt means the listener is bound — no extra /health probe needed.
	return {
		baseUrl: ready.baseUrl,
		message: 'started in the background',
		ownedPid: spawned?.pid ?? null
	};
}

function startDocsServerInBackground(workspaceRoot: string): SpawnedProcess | null {
	const child = spawn(
		'bun',
		['run', 'dev', '--', '--host', DEFAULT_DOCS_HOST, '--port', String(DEFAULT_DOCS_PORT)],
		{
			cwd: resolve(workspaceRoot, 'apps/docs'),
			detached: true,
			stdio: 'ignore'
		}
	);

	child.unref();
	return child.pid !== undefined ? { pid: child.pid } : null;
}

async function ensureDocsServer(
	workspaceRoot: string,
	docsBaseUrl: string
): Promise<EnsureDocsServerResult> {
	return ensureUrlReady(
		docsBaseUrl,
		() => startDocsServerInBackground(workspaceRoot),
		`Unable to start the docs app at ${docsBaseUrl}.`
	);
}

const defaultRuntime: LauncherRuntime = {
	ensureDocsServer,
	ensureFeedbackServer: (workspaceRoot) => ensureFeedbackServer(workspaceRoot, { workspaceRoot }),
	ensureFeedbackUiBuilt: (workspaceRoot) => ensureFeedbackUiBuilt({ workspaceRoot }),
	killOwnedProcess: killOwnedProcessDefault,
	isInteractiveTTY,
	now: () => Date.now(),
	openBrowser,
	onProgress: () => {}
};

export async function runLauncher(
	args: string[],
	options: RunLauncherOptions = {}
): Promise<boolean> {
	if (hasFlag(args, '--help')) {
		launcherHelp();
	}

	const workspaceRoot = findLauncherWorkspaceRoot(options.cwd);
	if (!workspaceRoot) {
		return false;
	}

	const runtime = {
		...defaultRuntime,
		...options.runtime
	};
	const exitOnComplete = options.exitOnComplete ?? true;

	const buildResult = runtime.ensureFeedbackUiBuilt(workspaceRoot);
	if (buildResult) {
		emitOrRun(buildResult, 'toon', exitOnComplete);
		return true;
	}

	const docsBaseUrl = `http://${DEFAULT_DOCS_HOST}:${DEFAULT_DOCS_PORT}`;
	const noOpen = hasFlag(args, '--no-open');
	const detach = hasFlag(args, '--detach');

	try {
		runtime.onProgress({ workspaceRoot, noOpen });

		const [feedbackResult, docsResult] = await settleOrKillOnRejection(
			[
				runtime.ensureFeedbackServer(workspaceRoot),
				runtime.ensureDocsServer(workspaceRoot, docsBaseUrl)
			],
			runtime.killOwnedProcess
		);
		const siteUrl = normalizeDevUrl(docsBaseUrl, feedbackResult.baseUrl);
		const dashboardUrl = buildDashboardUrl(feedbackResult.baseUrl, docsBaseUrl, runtime.now());
		const opened = noOpen ? false : runtime.openBrowser(siteUrl ?? dashboardUrl);

		const ownedPids = collectOwnedPids(feedbackResult.ownedPid, docsResult.ownedPid);
		const waitForeground = !detach && runtime.isInteractiveTTY() && ownedPids.length > 0;

		const notes: LabelledMessage[] = [];
		if (waitForeground) {
			notes.push({ label: 'Tip', message: 'press Ctrl-C to stop servers and exit' });
		}

		emitCommandResult(
			{
				output: renderDashboardOutput({
					rootLabel: 'Workspace',
					rootValue: workspaceRoot,
					siteUrl,
					dashboardUrl,
					servers: [
						{ label: 'Docs', message: docsResult.message },
						{ label: 'Feedback', message: `${feedbackResult.message} at ${feedbackResult.baseUrl}` }
					],
					noOpen,
					opened,
					...(notes.length > 0 ? { notes } : {})
				}),
				error: null,
				exitCode: 0
			},
			'toon'
		);

		if (waitForeground) {
			await waitForShutdownSignal({ ownedPids, killOwnedProcess: runtime.killOwnedProcess });
			// Ctrl-C / SIGINT is the only way out of the foreground wait.
			process.exit(0);
		}

		if (exitOnComplete) {
			process.exit(0);
		}
	} catch (error) {
		emitLauncherError(error, exitOnComplete);
	}

	return true;
}
