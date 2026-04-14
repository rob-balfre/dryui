import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
	DEFAULT_FEEDBACK_HOST,
	DEFAULT_FEEDBACK_PORT,
	FeedbackHttpClient,
	toFeedbackBaseUrl
} from '@dryui/feedback-server';
import { printCommandHelp, runCommand, type CommandResult } from '../run.js';
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
}

interface RunLauncherOptions {
	cwd?: string;
	runtime?: Partial<LauncherRuntime>;
}

export interface LauncherTargets {
	docs: string;
	feedback: string;
	theme: string;
	view: string;
}

function hasFlag(args: string[], name: string): boolean {
	return args.includes(name);
}

function launcherHelp(): never {
	printCommandHelp(
		{
			usage: 'dryui launcher [--no-open]',
			description: [
				'Open the local DryUI workbench for this repository.',
				'The CLI starts the docs app and feedback server in the background when they are not already running.'
			],
			options: ['  --no-open         Print the launcher URL without opening a browser'],
			examples: ['  dryui', '  dryui launcher --no-open']
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

export function buildLauncherTargets(
	feedbackBaseUrl: string,
	docsBaseUrl: string
): LauncherTargets {
	return {
		view: `${docsBaseUrl}/view/bench/visual`,
		feedback: `${feedbackBaseUrl}/ui`,
		docs: `${docsBaseUrl}/`,
		theme: `${docsBaseUrl}/theme-wizard`
	};
}

export function buildLauncherUrl(
	feedbackBaseUrl: string,
	docsBaseUrl: string,
	version = Date.now()
): string {
	const launcherUrl = new URL('/ui/launcher.html', feedbackBaseUrl);
	const targets = buildLauncherTargets(feedbackBaseUrl, docsBaseUrl);

	launcherUrl.searchParams.set('v', String(version));
	launcherUrl.searchParams.set('view', targets.view);
	launcherUrl.searchParams.set('feedback', targets.feedback);
	launcherUrl.searchParams.set('docs', targets.docs);
	launcherUrl.searchParams.set('theme', targets.theme);

	return launcherUrl.toString();
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
	ensureFeedbackUiBuilt: (workspaceRoot) =>
		ensureFeedbackUiBuilt({ workspaceRoot, includeLauncher: true }),
	now: () => Date.now(),
	openBrowser
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

	const buildResult = runtime.ensureFeedbackUiBuilt(workspaceRoot);
	if (buildResult) {
		runCommand(buildResult);
		return true;
	}

	const feedbackBaseUrl = toFeedbackBaseUrl(DEFAULT_FEEDBACK_HOST, DEFAULT_FEEDBACK_PORT);
	const docsBaseUrl = `http://${DEFAULT_DOCS_HOST}:${DEFAULT_DOCS_PORT}`;
	const feedbackClient = new FeedbackHttpClient(feedbackBaseUrl);

	try {
		const [feedbackMessage, docsMessage] = await Promise.all([
			runtime.ensureFeedbackServer(workspaceRoot, feedbackClient),
			runtime.ensureDocsServer(workspaceRoot, docsBaseUrl)
		]);
		const launcherUrl = buildLauncherUrl(feedbackClient.baseUrl, docsBaseUrl, runtime.now());
		const noOpen = hasFlag(args, '--no-open');
		const opened = noOpen ? false : runtime.openBrowser(launcherUrl);

		runCommand({
			output: [
				'DryUI launcher',
				'',
				`Workspace: ${workspaceRoot}`,
				`Launcher: ${launcherUrl}`,
				`Docs: ${docsMessage}`,
				`Feedback: ${feedbackMessage}`,
				`Browser: ${
					noOpen
						? 'skipped (--no-open)'
						: opened
							? 'opening default browser'
							: 'could not auto-open; use the launcher URL above'
				}`
			].join('\n'),
			error: null,
			exitCode: 0
		});
	} catch (error) {
		if (error instanceof Error && error.message === 'exit') {
			throw error;
		}

		runCommand({
			output: '',
			error: error instanceof Error ? error.message : String(error),
			exitCode: 1
		});
	}

	return true;
}
