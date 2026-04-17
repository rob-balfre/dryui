import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
	DEFAULT_FEEDBACK_HOST,
	DEFAULT_FEEDBACK_PORT,
	FeedbackHttpClient,
	toFeedbackBaseUrl
} from '@dryui/feedback-server';
import { emitOrRun, hasFlag, printCommandHelp, type CommandResult } from '../run.js';
import { ensureFeedbackUiBuilt } from './feedback-ui-build.js';
import {
	ensureUrlReady,
	isHealthyProbeStatus,
	openBrowser,
	resolveFeedbackServerEntry,
	spawnFeedbackServerInBackground
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

export function buildDashboardUrl(
	feedbackBaseUrl: string,
	docsBaseUrl: string,
	version = Date.now()
): string {
	const devTarget = new URL(docsBaseUrl);
	devTarget.searchParams.set('dryui-feedback', '1');

	const dashboardUrl = new URL('/ui/', feedbackBaseUrl);
	dashboardUrl.searchParams.set('v', String(version));
	dashboardUrl.searchParams.set('dev', devTarget.toString());
	return dashboardUrl.toString();
}

async function ensureFeedbackServer(
	workspaceRoot: string,
	client: FeedbackHttpClient
): Promise<string> {
	return ensureUrlReady(
		`${client.baseUrl}/health`,
		() =>
			spawnFeedbackServerInBackground({
				entry: resolveFeedbackServerEntry({ workspaceRoot }),
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
				output: [
					'DryUI feedback dashboard',
					'',
					`Workspace: ${workspaceRoot}`,
					`Dashboard: ${dashboardUrl}`,
					`Docs: ${docsMessage}`,
					`Feedback: ${feedbackMessage}`,
					`Browser: ${
						noOpen
							? 'skipped (--no-open)'
							: opened
								? 'opening default browser'
								: 'could not auto-open; use the dashboard URL above'
					}`
				].join('\n'),
				error: null,
				exitCode: 0
			},
			'toon',
			exitOnComplete
		);
	} catch (error) {
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

	return true;
}
