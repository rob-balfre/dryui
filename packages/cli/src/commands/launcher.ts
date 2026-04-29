import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import {
	DEFAULT_FEEDBACK_HOST,
	DEFAULT_FEEDBACK_PORT,
	normalizeDevUrl,
	projectFeedbackPaths,
	readFeedbackServerConfig,
	toFeedbackBaseUrl
} from '@dryui/feedback-server';
import {
	detectProject as detectProjectDefault,
	type DryuiPackageManager,
	type ProjectDetection,
	type ProjectPlannerSpec
} from '@dryui/mcp/project-planner';
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
	ensureClaudeAgents as ensureClaudeAgentsDefault,
	ensureUrlReady,
	FEEDBACK_SERVER_URL,
	findPortHolder as findPortHolderDefault,
	findViteConfig as findViteConfigDefault,
	installPackage as installPackageDefault,
	isDryuiDevMode,
	isHealthyProbeStatus,
	killOwnedProcess as killOwnedProcessDefault,
	killPortHolder as killPortHolderDefault,
	linkPackage as linkPackageDefault,
	mountFeedbackInLayout as mountFeedbackInLayoutDefault,
	openBrowser,
	patchViteConfigFeedbackNoExternal as patchViteConfigFeedbackNoExternalDefault,
	type PortHolder,
	projectDevLogPath,
	projectHasDependency as projectHasDependencyDefault,
	readProjectDevLogTail as readProjectDevLogTailDefault,
	readProjectDevScript as readProjectDevScriptDefault,
	resolveFeedbackServerEntry,
	runPackageManagerInstall as runPackageManagerInstallDefault,
	spawnFeedbackServerInBackground,
	spawnProjectDevServerInBackground as spawnProjectDevServerDefault,
	type SpawnedProcess,
	type SpawnProjectDevServerOptions,
	swapDryuiTarballOverridesToLinks as swapDryuiTarballOverridesToLinksDefault,
	type SwapTarballOverridesResult,
	urlResponds as urlRespondsDefault,
	type UrlProbeResult,
	viteConfigHasFeedbackNoExternal as viteConfigHasFeedbackNoExternalDefault,
	waitForUrlDetailed as waitForUrlDetailedDefault
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

function feedbackWidgetNote(detection: ProjectDetection): LabelledMessage | null {
	const label = 'Feedback widget';
	if (!detection.dependencies.feedback) {
		const pm = detection.packageManager === 'unknown' ? 'bun' : detection.packageManager;
		return {
			label,
			message: `not installed — run \`${pm} add @dryui/feedback\` and mount \`<Feedback serverUrl="http://127.0.0.1:4748" />\` in src/routes/+layout.svelte`
		};
	}
	if (!detection.feedback.layoutPath) {
		return {
			label,
			message:
				'not mounted — import `{ Feedback } from "@dryui/feedback"` and render `<Feedback serverUrl="http://127.0.0.1:4748" />` in src/routes/+layout.svelte'
		};
	}
	return null;
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
		const devTarget = new URL(docsBaseUrl);
		devTarget.searchParams.set('dryui-feedback', '1');
		dashboardUrl.searchParams.set('dev', devTarget.toString());
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

const DEFAULT_PROJECT_DEV_HOST = '127.0.0.1';
const DEFAULT_PROJECT_DEV_PORT = 5173;
const PROJECT_DEV_READY_TIMEOUT_MS = 30_000;
const PORT_FREE_WAIT_MS = 500;

export interface FeedbackSetupPlan {
	install: boolean;
	mount: boolean;
	layoutPath: string | null;
	viteConfig: boolean;
	viteConfigPath: string | null;
}

export interface UserProjectLauncherRuntime {
	detectProject: (cwd: string) => ProjectDetection;
	readProjectDevScript: (root: string) => string | null;
	ensureFeedbackServer: (projectRoot: string) => Promise<EnsureFeedbackServerResult>;
	ensureFeedbackUiBuilt: () => CommandResult | null;
	urlResponds: (url: string) => Promise<boolean>;
	findPortHolder: (port: number) => PortHolder | null;
	killPortHolder: (pid: number) => boolean;
	killOwnedProcess: (pid: number) => void;
	isInteractiveTTY: () => boolean;
	spawnProjectDevServer: (options: SpawnProjectDevServerOptions) => SpawnedProcess | null;
	waitForUrlDetailed: (url: string, timeoutMs: number) => Promise<UrlProbeResult>;
	readProjectDevLogTail: (logPath: string, maxLines?: number) => string[];
	promptKillPortHolder: (holder: PortHolder, port: number) => Promise<boolean>;
	promptFeedbackSetup: (plan: FeedbackSetupPlan) => Promise<boolean>;
	projectHasDependency: (root: string, name: string) => boolean;
	installPackage: (
		cwd: string,
		packageManager: Exclude<DryuiPackageManager, 'unknown'>,
		packageNames: string[]
	) => boolean;
	linkPackage: (
		cwd: string,
		packageManager: Exclude<DryuiPackageManager, 'unknown'>,
		packageNames: string[]
	) => boolean;
	mountFeedbackInLayout: (layoutPath: string, serverUrl: string) => boolean;
	findViteConfig: (root: string) => string | null;
	viteConfigHasFeedbackNoExternal: (configPath: string) => boolean;
	patchViteConfigFeedbackNoExternal: (configPath: string) => boolean;
	swapDryuiTarballOverridesToLinks: (cwd: string) => SwapTarballOverridesResult;
	ensureClaudeAgents: (projectRoot: string) => {
		copied: readonly string[];
		updated: readonly string[];
	};
	runPackageManagerInstall: (
		cwd: string,
		packageManager: Exclude<DryuiPackageManager, 'unknown'>
	) => boolean;
	sleep: (ms: number) => Promise<void>;
	now: () => number;
	openBrowser: (url: string) => boolean;
	onProgress: (info: { cwd: string; noOpen: boolean; projectRoot: string }) => void;
}

export interface RunUserProjectLauncherOptions {
	cwd?: string;
	spec: Pick<ProjectPlannerSpec, 'themeImports'>;
	runtime?: Partial<UserProjectLauncherRuntime>;
	exitOnComplete?: boolean;
}

type DevServerPlan =
	| { kind: 'keep'; url: string }
	| { kind: 'spawn'; url: string; killPid?: number }
	| { kind: 'skip'; url: string; reason: string };

interface DevServerExecutionResult {
	ok: boolean;
	url: string;
	message: string;
	ownedPid: number | null;
	errorDetails?: LabelledMessage[];
}

async function planUserProjectDevServer(
	runtime: UserProjectLauncherRuntime,
	options: { host: string; port: number; root: string }
): Promise<DevServerPlan> {
	const url = `http://${options.host}:${options.port}`;
	const holder = runtime.findPortHolder(options.port);

	if (await runtime.urlResponds(url)) {
		if (!holder || portHolderMatchesProject(holder, options.root)) {
			return { kind: 'keep', url };
		}
		const kill = await runtime.promptKillPortHolder(holder, options.port);
		if (kill) {
			return { kind: 'spawn', url, killPid: holder.pid };
		}
		return {
			kind: 'skip',
			url,
			reason: `port ${options.port} busy (PID ${holder.pid} ${holder.command})`
		};
	}

	if (!holder) {
		return { kind: 'spawn', url };
	}

	const kill = await runtime.promptKillPortHolder(holder, options.port);
	if (!kill) {
		return {
			kind: 'skip',
			url,
			reason: `port ${options.port} busy (PID ${holder.pid} ${holder.command})`
		};
	}

	return { kind: 'spawn', url, killPid: holder.pid };
}

function portHolderMatchesProject(holder: PortHolder, root: string): boolean {
	if (!holder.cwd) return false;
	const holderCwd = resolve(holder.cwd);
	const projectRoot = resolve(root);
	return holderCwd === projectRoot || holderCwd.startsWith(`${projectRoot}${sep}`);
}

function formatProbeFailureMessage(probe: UrlProbeResult, timeoutSec: number): string {
	if (probe.status !== undefined) {
		return `failed: HTTP ${probe.status} after ${timeoutSec}s`;
	}
	if (probe.transportError) {
		return `failed: no response after ${timeoutSec}s (${probe.transportError})`;
	}
	return `failed: no response after ${timeoutSec}s`;
}

function buildDevServerErrorDetails(
	probe: UrlProbeResult,
	logPath: string | null,
	logTail: readonly string[]
): LabelledMessage[] {
	const details: LabelledMessage[] = [];
	if (probe.errorSummary) {
		details.push({ label: 'Project dev error', message: probe.errorSummary });
	}
	if (logTail.length > 0) {
		const joined = logTail.join('\n    ');
		details.push({ label: 'Project dev log tail', message: `\n    ${joined}` });
	}
	if (logPath) {
		details.push({ label: 'Project dev log', message: logPath });
	}
	return details;
}

async function executeUserProjectDevServerPlan(
	runtime: UserProjectLauncherRuntime,
	plan: DevServerPlan,
	options: SpawnProjectDevServerOptions
): Promise<DevServerExecutionResult> {
	if (plan.kind === 'keep') {
		return { ok: true, url: plan.url, message: 'already running', ownedPid: null };
	}
	if (plan.kind === 'skip') {
		return { ok: false, url: plan.url, message: `skipped (${plan.reason})`, ownedPid: null };
	}

	if (plan.killPid !== undefined) {
		const killed = runtime.killPortHolder(plan.killPid);
		if (!killed) {
			return {
				ok: false,
				url: plan.url,
				message: `skipped (failed to kill PID ${plan.killPid})`,
				ownedPid: null
			};
		}
		await runtime.sleep(PORT_FREE_WAIT_MS);
	}

	const spawned = runtime.spawnProjectDevServer(options);
	const probe = await runtime.waitForUrlDetailed(plan.url, PROJECT_DEV_READY_TIMEOUT_MS);
	if (probe.ok) {
		return {
			ok: true,
			url: plan.url,
			message: 'started in the background',
			ownedPid: spawned?.pid ?? null
		};
	}

	const timeoutSec = PROJECT_DEV_READY_TIMEOUT_MS / 1000;
	const logPath = options.logPath ?? null;
	const logTail = logPath ? runtime.readProjectDevLogTail(logPath) : [];
	return {
		ok: false,
		url: plan.url,
		message: formatProbeFailureMessage(probe, timeoutSec),
		ownedPid: spawned?.pid ?? null,
		errorDetails: buildDevServerErrorDetails(probe, logPath, logTail)
	};
}

const defaultUserProjectRuntime: Omit<UserProjectLauncherRuntime, 'detectProject'> = {
	readProjectDevScript: readProjectDevScriptDefault,
	ensureFeedbackServer: (projectRoot) =>
		ensureFeedbackServer(projectRoot, { preferPackaged: true }),
	ensureFeedbackUiBuilt: () => ensureFeedbackUiBuilt({}),
	urlResponds: urlRespondsDefault,
	findPortHolder: findPortHolderDefault,
	killPortHolder: killPortHolderDefault,
	killOwnedProcess: killOwnedProcessDefault,
	isInteractiveTTY,
	spawnProjectDevServer: spawnProjectDevServerDefault,
	waitForUrlDetailed: waitForUrlDetailedDefault,
	readProjectDevLogTail: readProjectDevLogTailDefault,
	// Default declines to kill — safe for non-TTY callers that have no way to confirm.
	promptKillPortHolder: async () => false,
	// Default declines setup — safe for non-TTY callers that have no way to confirm.
	promptFeedbackSetup: async () => false,
	projectHasDependency: projectHasDependencyDefault,
	installPackage: (cwd, packageManager, packageNames) =>
		installPackageDefault({ cwd, packageManager, packageNames }),
	linkPackage: (cwd, packageManager, packageNames) =>
		linkPackageDefault({ cwd, packageManager, packageNames }),
	mountFeedbackInLayout: (layoutPath, serverUrl) =>
		mountFeedbackInLayoutDefault({ layoutPath, serverUrl }),
	findViteConfig: findViteConfigDefault,
	viteConfigHasFeedbackNoExternal: viteConfigHasFeedbackNoExternalDefault,
	patchViteConfigFeedbackNoExternal: patchViteConfigFeedbackNoExternalDefault,
	swapDryuiTarballOverridesToLinks: swapDryuiTarballOverridesToLinksDefault,
	ensureClaudeAgents: (projectRoot) => {
		const result = ensureClaudeAgentsDefault(projectRoot);
		return { copied: result.copied, updated: result.updated };
	},
	runPackageManagerInstall: (cwd, packageManager) =>
		runPackageManagerInstallDefault({ cwd, packageManager }),
	sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
	now: () => Date.now(),
	openBrowser,
	onProgress: () => {}
};

async function planAndApplyFeedbackSetup(
	detection: ProjectDetection,
	packageManager: Exclude<DryuiPackageManager, 'unknown'>,
	runtime: UserProjectLauncherRuntime
): Promise<LabelledMessage[] | null> {
	const layoutPath = detection.files.rootLayout;
	const existingViteConfig = detection.root ? runtime.findViteConfig(detection.root) : null;
	const viteConfigPath =
		existingViteConfig ??
		(detection.root && layoutPath ? resolve(detection.root, 'vite.config.ts') : null);
	const viteConfigPatched = existingViteConfig
		? runtime.viteConfigHasFeedbackNoExternal(existingViteConfig)
		: false;

	const needsInstall = !detection.dependencies.feedback;
	const needsLucideInstall = detection.root
		? !runtime.projectHasDependency(detection.root, 'lucide-svelte')
		: false;
	const needsMount = !detection.feedback.layoutPath;
	const needsViteConfig = viteConfigPath !== null && !viteConfigPatched;

	if (!needsInstall && !needsLucideInstall && !needsMount && !needsViteConfig) return null;

	if (needsMount && !layoutPath) {
		return [
			{
				label: 'Feedback widget',
				message: 'no src/routes/+layout.svelte — create one and rerun'
			}
		];
	}

	const plan: FeedbackSetupPlan = {
		install: needsInstall,
		mount: needsMount,
		layoutPath,
		viteConfig: needsViteConfig,
		viteConfigPath
	};

	const confirmed = await runtime.promptFeedbackSetup(plan);
	if (!confirmed) return null;

	const notes: LabelledMessage[] = [];

	const devMode = process.env['DRYUI_DEV'] === '1' || process.env['DRYUI_DEV'] === 'true';

	const packagesToInstall: string[] = [];
	if (needsInstall && !devMode) packagesToInstall.push('@dryui/feedback');
	if (needsLucideInstall) packagesToInstall.push('lucide-svelte');

	if (packagesToInstall.length > 0) {
		const installed = runtime.installPackage(detection.root!, packageManager, packagesToInstall);
		if (!installed) {
			notes.push({
				label: 'Feedback widget',
				message: `install failed: run \`${packageManager} add ${packagesToInstall.join(' ')}\` manually`
			});
			return notes;
		}
		if (needsLucideInstall) {
			notes.push({
				label: 'Feedback icons',
				message: 'installed lucide-svelte (peer dependency of @dryui/feedback)'
			});
		}
	}

	if (needsInstall && devMode) {
		const linked = runtime.linkPackage(detection.root!, packageManager, ['@dryui/feedback']);
		if (!linked) {
			notes.push({
				label: 'Feedback widget',
				message: `link failed: run \`${packageManager} link @dryui/feedback\` manually (and \`bun run dev:link\` from the dryui workspace first)`
			});
			return notes;
		}
		notes.push({
			label: 'Feedback widget',
			message:
				'linked from workspace (DRYUI_DEV=1) — edits to packages/feedback/src reflect via Vite HMR'
		});
	}

	if (needsMount && layoutPath) {
		const mounted = runtime.mountFeedbackInLayout(layoutPath, FEEDBACK_SERVER_URL);
		notes.push({
			label: 'Feedback widget',
			message: mounted ? `mounted in ${layoutPath}` : `failed to edit ${layoutPath}`
		});
	}

	if (needsViteConfig && viteConfigPath) {
		const patched = runtime.patchViteConfigFeedbackNoExternal(viteConfigPath);
		notes.push({
			label: 'Vite config',
			message: patched
				? `added @dryui/feedback and lucide-svelte to ssr.noExternal in ${viteConfigPath}`
				: `could not patch ${viteConfigPath}: add @dryui/feedback and lucide-svelte to ssr.noExternal manually`
		});
	}

	return notes;
}

export async function runUserProjectLauncher(
	args: string[],
	options: RunUserProjectLauncherOptions
): Promise<boolean> {
	const cwd = options.cwd ?? process.cwd();
	const runtime: UserProjectLauncherRuntime = {
		...defaultUserProjectRuntime,
		detectProject: (path) => detectProjectDefault(options.spec, path),
		...options.runtime
	};
	const exitOnComplete = options.exitOnComplete ?? true;

	const detection = runtime.detectProject(cwd);
	if (detection.status !== 'ready' || !detection.root) return false;
	const packageManager = detection.packageManager;
	if (packageManager === 'unknown') return false;
	if (!runtime.readProjectDevScript(detection.root)) return false;

	const buildResult = runtime.ensureFeedbackUiBuilt();
	if (buildResult) {
		emitOrRun(buildResult, 'toon', exitOnComplete);
		return true;
	}

	// In DRYUI_DEV mode, swap any tarball overrides to `link:` so the workspace
	// symlinks (registered by `bun run dev:link`) win and Vite resolves through
	// each package's "development" exports condition into src/. Without this,
	// the launcher would keep installing frozen tarballs and edits in the
	// dryui workspace would never reach the consumer.
	const overrideSwap: SwapTarballOverridesResult = isDryuiDevMode()
		? runtime.swapDryuiTarballOverridesToLinks(detection.root)
		: { swapped: [], already: [] };
	if (overrideSwap.swapped.length > 0) {
		runtime.runPackageManagerInstall(detection.root, packageManager);
	}

	// Mirror the bundled subagent files into `<project>/.claude/agents/`. The
	// dispatched session runs `claude --agent feedback`, which silently
	// ignores `--permission-mode auto` unless the agent's frontmatter sets it.
	// Re-syncing on every launcher run lets existing projects (where init
	// predated this step, or where we've shipped new agent frontmatter) pick
	// up the change without a manual reinit.
	const claudeAgents = runtime.ensureClaudeAgents(detection.root);

	const noOpen = hasFlag(args, '--no-open');
	const detach = hasFlag(args, '--detach');
	const devHost = DEFAULT_PROJECT_DEV_HOST;
	const devPort = DEFAULT_PROJECT_DEV_PORT;

	try {
		const plan = await planUserProjectDevServer(runtime, {
			host: devHost,
			port: devPort,
			root: detection.root
		});
		const setupNotes = await planAndApplyFeedbackSetup(detection, packageManager, runtime);

		runtime.onProgress({ cwd, noOpen, projectRoot: detection.root });

		const devLogPath = plan.kind === 'spawn' ? projectDevLogPath(detection.root) : null;
		const [feedbackResult, devResult] = await settleOrKillOnRejection(
			[
				runtime.ensureFeedbackServer(detection.root),
				executeUserProjectDevServerPlan(runtime, plan, {
					root: detection.root,
					packageManager,
					host: devHost,
					port: devPort,
					...(devLogPath ? { logPath: devLogPath } : {})
				})
			],
			runtime.killOwnedProcess
		);

		const siteUrl = normalizeDevUrl(devResult.ok ? devResult.url : null);
		const dashboardUrl = buildDashboardUrl(
			feedbackResult.baseUrl,
			devResult.ok ? devResult.url : null,
			runtime.now()
		);
		const primaryUrl = siteUrl ?? dashboardUrl;
		const opened = noOpen ? false : runtime.openBrowser(primaryUrl);

		const ownedPids = collectOwnedPids(feedbackResult.ownedPid, devResult.ownedPid);
		const waitForeground = !detach && runtime.isInteractiveTTY() && ownedPids.length > 0;

		const fallbackNote = feedbackWidgetNote(detection);
		const baseNotes = setupNotes ?? (fallbackNote ? [fallbackNote] : []);
		const notes: LabelledMessage[] = [...baseNotes, ...(devResult.errorDetails ?? [])];
		if (overrideSwap.swapped.length > 0) {
			notes.push({
				label: 'DryUI dev',
				message: `swapped tarball overrides → link: for ${overrideSwap.swapped.join(', ')} (DRYUI_DEV=1)`
			});
		}
		const agentChanges = [
			...claudeAgents.copied.map((name) => `+ ${name}`),
			...claudeAgents.updated.map((name) => `~ ${name}`)
		];
		if (agentChanges.length > 0) {
			notes.push({
				label: 'Claude agents',
				message: `synced .claude/agents/ (${agentChanges.join(', ')})`
			});
		}
		if (waitForeground) {
			notes.push({ label: 'Tip', message: 'press Ctrl-C to stop servers and exit' });
		}

		emitCommandResult(
			{
				output: renderDashboardOutput({
					rootLabel: 'Project',
					rootValue: detection.root,
					siteUrl,
					dashboardUrl,
					servers: [
						{
							label: 'Project dev',
							message: `${devResult.message}${devResult.ok ? ` at ${devResult.url}` : ''}`
						},
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
		}

		if (exitOnComplete) {
			process.exit(0);
		}
	} catch (error) {
		emitLauncherError(error, exitOnComplete);
	}

	return true;
}

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
		const siteUrl = normalizeDevUrl(docsBaseUrl);
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
		}

		if (exitOnComplete) {
			process.exit(0);
		}
	} catch (error) {
		emitLauncherError(error, exitOnComplete);
	}

	return true;
}
