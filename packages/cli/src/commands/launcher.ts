import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
	DEFAULT_FEEDBACK_HOST,
	DEFAULT_FEEDBACK_PORT,
	FeedbackHttpClient,
	toFeedbackBaseUrl
} from '@dryui/feedback-server';
import {
	detectProject as detectProjectDefault,
	type DryuiPackageManager,
	type ProjectDetection,
	type ProjectPlannerSpec
} from '@dryui/mcp/project-planner';
import { emitOrRun, hasFlag, printCommandHelp, type CommandResult } from '../run.js';
import { ensureFeedbackUiBuilt } from './feedback-ui-build.js';
import {
	ensureUrlReady,
	findPortHolder as findPortHolderDefault,
	findViteConfig as findViteConfigDefault,
	installPackage as installPackageDefault,
	isHealthyProbeStatus,
	killPortHolder as killPortHolderDefault,
	mountFeedbackInLayout as mountFeedbackInLayoutDefault,
	openBrowser,
	patchViteConfigFeedbackNoExternal as patchViteConfigFeedbackNoExternalDefault,
	type PortHolder,
	readProjectDevScript as readProjectDevScriptDefault,
	resolveFeedbackServerEntry,
	spawnFeedbackServerInBackground,
	spawnProjectDevServerInBackground as spawnProjectDevServerDefault,
	type SpawnProjectDevServerOptions,
	urlResponds as urlRespondsDefault,
	viteConfigHasFeedbackNoExternal as viteConfigHasFeedbackNoExternalDefault,
	waitForUrl as waitForUrlDefault
} from './launch-utils.js';

export { isHealthyProbeStatus };

const DEFAULT_DOCS_HOST = '127.0.0.1';
const DEFAULT_DOCS_PORT = 5173;

interface LauncherRuntime {
	ensureDocsServer: (workspaceRoot: string, docsBaseUrl: string) => Promise<string>;
	ensureFeedbackServer: (workspaceRoot: string, client: FeedbackHttpClient) => Promise<string>;
	ensureFeedbackUiBuilt: (workspaceRoot: string) => CommandResult | null;
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
			usage: 'dryui [--no-open]',
			description: [
				'Open the feedback dashboard for this repository.',
				'The CLI starts the docs app and feedback server in the background when they are not already running.'
			],
			options: ['  --no-open         Print the dashboard URL without opening a browser'],
			examples: ['  dryui', '  dryui --no-open']
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
			: 'could not auto-open; use the dashboard URL above';

	return [
		'DryUI feedback dashboard',
		'',
		`${sections.rootLabel}: ${sections.rootValue}`,
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

	emitOrRun(
		{
			output: '',
			error: error instanceof Error ? error.message : String(error),
			exitCode: 1
		},
		'toon',
		exitOnComplete
	);
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

async function ensureFeedbackServer(
	workspaceRoot: string,
	client: FeedbackHttpClient,
	options: { preferPackaged?: boolean } = {}
): Promise<string> {
	return ensureUrlReady(
		`${client.baseUrl}/health`,
		() =>
			spawnFeedbackServerInBackground({
				entry: resolveFeedbackServerEntry({
					workspaceRoot,
					...(options.preferPackaged ? { preferPackaged: true } : {})
				}),
				cwd: workspaceRoot,
				host: DEFAULT_FEEDBACK_HOST,
				port: DEFAULT_FEEDBACK_PORT
			}),
		`Unable to start the feedback server at ${client.baseUrl}.`
	);
}

function startDocsServerInBackground(workspaceRoot: string): void {
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
}

async function ensureDocsServer(workspaceRoot: string, docsBaseUrl: string): Promise<string> {
	return ensureUrlReady(
		docsBaseUrl,
		() => startDocsServerInBackground(workspaceRoot),
		`Unable to start the docs app at ${docsBaseUrl}.`
	);
}

const defaultRuntime: LauncherRuntime = {
	ensureDocsServer,
	ensureFeedbackServer,
	ensureFeedbackUiBuilt: (workspaceRoot) => ensureFeedbackUiBuilt({ workspaceRoot }),
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
	ensureFeedbackServer: (projectRoot: string, client: FeedbackHttpClient) => Promise<string>;
	ensureFeedbackUiBuilt: () => CommandResult | null;
	urlResponds: (url: string) => Promise<boolean>;
	findPortHolder: (port: number) => PortHolder | null;
	killPortHolder: (pid: number) => boolean;
	spawnProjectDevServer: (options: SpawnProjectDevServerOptions) => void;
	waitForUrl: (url: string, timeoutMs: number) => Promise<boolean>;
	promptKillPortHolder: (holder: PortHolder, port: number) => Promise<boolean>;
	promptFeedbackSetup: (plan: FeedbackSetupPlan) => Promise<boolean>;
	installPackage: (
		cwd: string,
		packageManager: Exclude<DryuiPackageManager, 'unknown'>,
		packageName: string
	) => boolean;
	mountFeedbackInLayout: (layoutPath: string, serverUrl: string) => boolean;
	findViteConfig: (root: string) => string | null;
	viteConfigHasFeedbackNoExternal: (configPath: string) => boolean;
	patchViteConfigFeedbackNoExternal: (configPath: string) => boolean;
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

async function planUserProjectDevServer(
	runtime: UserProjectLauncherRuntime,
	options: { host: string; port: number }
): Promise<DevServerPlan> {
	const url = `http://${options.host}:${options.port}`;

	if (await runtime.urlResponds(url)) {
		return { kind: 'keep', url };
	}

	const holder = runtime.findPortHolder(options.port);
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

async function executeUserProjectDevServerPlan(
	runtime: UserProjectLauncherRuntime,
	plan: DevServerPlan,
	options: SpawnProjectDevServerOptions
): Promise<{ ok: boolean; url: string; message: string }> {
	if (plan.kind === 'keep') {
		return { ok: true, url: plan.url, message: 'already running' };
	}
	if (plan.kind === 'skip') {
		return { ok: false, url: plan.url, message: `skipped (${plan.reason})` };
	}

	if (plan.killPid !== undefined) {
		const killed = runtime.killPortHolder(plan.killPid);
		if (!killed) {
			return {
				ok: false,
				url: plan.url,
				message: `skipped (failed to kill PID ${plan.killPid})`
			};
		}
		await runtime.sleep(PORT_FREE_WAIT_MS);
	}

	runtime.spawnProjectDevServer(options);
	const ready = await runtime.waitForUrl(plan.url, PROJECT_DEV_READY_TIMEOUT_MS);
	if (!ready) {
		return {
			ok: false,
			url: plan.url,
			message: `skipped (dev server did not respond within ${PROJECT_DEV_READY_TIMEOUT_MS / 1000}s)`
		};
	}
	return { ok: true, url: plan.url, message: 'started in the background' };
}

const defaultUserProjectRuntime: Omit<UserProjectLauncherRuntime, 'detectProject'> = {
	readProjectDevScript: readProjectDevScriptDefault,
	ensureFeedbackServer: (projectRoot, client) =>
		ensureFeedbackServer(projectRoot, client, { preferPackaged: true }),
	ensureFeedbackUiBuilt: () => ensureFeedbackUiBuilt({}),
	urlResponds: urlRespondsDefault,
	findPortHolder: findPortHolderDefault,
	killPortHolder: killPortHolderDefault,
	spawnProjectDevServer: spawnProjectDevServerDefault,
	waitForUrl: waitForUrlDefault,
	// Default declines to kill — safe for non-TTY callers that have no way to confirm.
	promptKillPortHolder: async () => false,
	// Default declines setup — safe for non-TTY callers that have no way to confirm.
	promptFeedbackSetup: async () => false,
	installPackage: (cwd, packageManager, packageName) =>
		installPackageDefault({ cwd, packageManager, packageName }),
	mountFeedbackInLayout: (layoutPath, serverUrl) =>
		mountFeedbackInLayoutDefault({ layoutPath, serverUrl }),
	findViteConfig: findViteConfigDefault,
	viteConfigHasFeedbackNoExternal: viteConfigHasFeedbackNoExternalDefault,
	patchViteConfigFeedbackNoExternal: patchViteConfigFeedbackNoExternalDefault,
	sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
	now: () => Date.now(),
	openBrowser,
	onProgress: () => {}
};

const FEEDBACK_SERVER_URL = `http://${DEFAULT_FEEDBACK_HOST}:${DEFAULT_FEEDBACK_PORT}`;

async function planAndApplyFeedbackSetup(
	detection: ProjectDetection,
	packageManager: Exclude<DryuiPackageManager, 'unknown'>,
	runtime: UserProjectLauncherRuntime
): Promise<LabelledMessage[] | null> {
	const layoutPath = detection.files.rootLayout;
	const viteConfigPath = detection.root ? runtime.findViteConfig(detection.root) : null;
	const viteConfigPatched = viteConfigPath
		? runtime.viteConfigHasFeedbackNoExternal(viteConfigPath)
		: true;

	const needsInstall = !detection.dependencies.feedback;
	const needsMount = !detection.feedback.layoutPath;
	const needsViteConfig = viteConfigPath !== null && !viteConfigPatched;

	if (!needsInstall && !needsMount && !needsViteConfig) return null;

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

	if (needsInstall) {
		const installed = runtime.installPackage(detection.root!, packageManager, '@dryui/feedback');
		if (!installed) {
			notes.push({
				label: 'Feedback widget',
				message: `install failed — run \`${packageManager} add @dryui/feedback\` manually`
			});
			return notes;
		}
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
				? `added @dryui/feedback to ssr.noExternal in ${viteConfigPath}`
				: `could not patch ${viteConfigPath} — add @dryui/feedback to ssr.noExternal manually`
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

	const feedbackBaseUrl = toFeedbackBaseUrl(DEFAULT_FEEDBACK_HOST, DEFAULT_FEEDBACK_PORT);
	const feedbackClient = new FeedbackHttpClient(feedbackBaseUrl);
	const noOpen = hasFlag(args, '--no-open');
	const devHost = DEFAULT_PROJECT_DEV_HOST;
	const devPort = DEFAULT_PROJECT_DEV_PORT;

	try {
		const plan = await planUserProjectDevServer(runtime, { host: devHost, port: devPort });
		const setupNotes = await planAndApplyFeedbackSetup(detection, packageManager, runtime);

		runtime.onProgress({ cwd, noOpen, projectRoot: detection.root });

		const [feedbackMessage, devResult] = await Promise.all([
			runtime.ensureFeedbackServer(detection.root, feedbackClient),
			executeUserProjectDevServerPlan(runtime, plan, {
				root: detection.root,
				packageManager,
				host: devHost,
				port: devPort
			})
		]);

		const dashboardUrl = buildDashboardUrl(
			feedbackClient.baseUrl,
			devResult.ok ? devResult.url : null,
			runtime.now()
		);
		const opened = noOpen ? false : runtime.openBrowser(dashboardUrl);

		const fallbackNote = feedbackWidgetNote(detection);
		const notes = setupNotes ?? (fallbackNote ? [fallbackNote] : []);

		emitOrRun(
			{
				output: renderDashboardOutput({
					rootLabel: 'Project',
					rootValue: detection.root,
					dashboardUrl,
					servers: [
						{
							label: 'Project dev',
							message: `${devResult.message}${devResult.ok ? ` at ${devResult.url}` : ''}`
						},
						{ label: 'Feedback', message: feedbackMessage }
					],
					noOpen,
					opened,
					...(notes.length > 0 ? { notes } : {})
				}),
				error: null,
				exitCode: 0
			},
			'toon',
			exitOnComplete
		);
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

	const feedbackBaseUrl = toFeedbackBaseUrl(DEFAULT_FEEDBACK_HOST, DEFAULT_FEEDBACK_PORT);
	const docsBaseUrl = `http://${DEFAULT_DOCS_HOST}:${DEFAULT_DOCS_PORT}`;
	const feedbackClient = new FeedbackHttpClient(feedbackBaseUrl);
	const noOpen = hasFlag(args, '--no-open');

	try {
		runtime.onProgress({ workspaceRoot, noOpen });

		const [feedbackMessage, docsMessage] = await Promise.all([
			runtime.ensureFeedbackServer(workspaceRoot, feedbackClient),
			runtime.ensureDocsServer(workspaceRoot, docsBaseUrl)
		]);
		const dashboardUrl = buildDashboardUrl(feedbackClient.baseUrl, docsBaseUrl, runtime.now());
		const opened = noOpen ? false : runtime.openBrowser(dashboardUrl);

		emitOrRun(
			{
				output: renderDashboardOutput({
					rootLabel: 'Workspace',
					rootValue: workspaceRoot,
					dashboardUrl,
					servers: [
						{ label: 'Docs', message: docsMessage },
						{ label: 'Feedback', message: feedbackMessage }
					],
					noOpen,
					opened
				}),
				error: null,
				exitCode: 0
			},
			'toon',
			exitOnComplete
		);
	} catch (error) {
		emitLauncherError(error, exitOnComplete);
	}

	return true;
}
