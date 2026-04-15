import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	DEFAULT_FEEDBACK_HOST,
	DEFAULT_FEEDBACK_PORT,
	DEFAULT_STORE_PATH,
	FeedbackHttpClient,
	parsePort,
	toFeedbackBaseUrl
} from '@dryui/feedback-server';
import {
	commandError,
	getFlag,
	hasFlag,
	printCommandHelp,
	runCommand,
	type CommandResult
} from '../run.js';
import { ensureFeedbackUiBuilt } from './feedback-ui-build.js';
import {
	ensureUrlReady,
	openBrowser,
	resolveFeedbackServerEntry,
	spawnFeedbackServerInBackground
} from './launch-utils.js';

const COMMANDS_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(COMMANDS_DIR, '..', '..', '..', '..');

function resolveServerEntry(): string {
	return resolveFeedbackServerEntry({ workspaceRoot: REPO_ROOT, preferPackaged: true });
}

function feedbackInitHelp(): never {
	printCommandHelp({
		usage: 'dryui feedback init',
		description: [
			'Print the recommended feedback-server setup for this machine.',
			'Shows the default URL, SQLite store path, and the ordered steps to run the server, register the MCP, and wire the prompt-submit hook.'
		],
		examples: ['  dryui feedback init']
	});
}

function getFeedbackInit(): CommandResult {
	return {
		output: [
			'DryUI feedback init',
			'',
			`Server URL: http://127.0.0.1:${DEFAULT_FEEDBACK_PORT}`,
			`SQLite store: ${DEFAULT_STORE_PATH}`,
			'Hook script: packages/feedback-server/hooks/check-feedback.sh',
			'',
			'Suggested next steps:',
			'1. Start the server with `dryui feedback server`.',
			'2. Add a separate feedback MCP entry that points at `packages/feedback-server/dist/mcp.js`.',
			'3. Register the hook script with your prompt-submit hook if you want pending annotations injected into context.',
			'',
			'next[2]{cmd,description}:',
			'  dryui feedback server,Start the local feedback server in the foreground',
			'  dryui feedback doctor,Probe a running feedback server for health + listener state'
		].join('\n'),
		error: null,
		exitCode: 0
	};
}

function feedbackDoctorHelp(): never {
	printCommandHelp({
		usage: 'dryui feedback doctor [--endpoint <url>]',
		description: [
			'Probe a running feedback server for health and listener stats.',
			'Hits /health and /status at the given endpoint and prints a compact report.'
		],
		options: ['  --endpoint <url>  Feedback server base URL (default http://127.0.0.1:4748)'],
		examples: [
			'  dryui feedback doctor',
			'  dryui feedback doctor --endpoint http://127.0.0.1:5757'
		]
	});
}

async function getFeedbackDoctor(args: string[]): Promise<CommandResult> {
	const endpoint = getFlag(args, '--endpoint');
	const client = new FeedbackHttpClient(endpoint);

	try {
		const [health, status] = await Promise.all([client.health(), client.status()]);
		return {
			output: [
				'DryUI feedback doctor',
				'',
				`Endpoint: ${client.baseUrl}`,
				`Health: ${health.status}`,
				`Active listeners: ${status.activeListeners}`,
				`Agent listeners: ${status.agentListeners}`,
				`Store path: ${DEFAULT_STORE_PATH}`
			].join('\n'),
			error: null,
			exitCode: 0
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return commandError('toon', 'feedback-unreachable', message, [
			'dryui feedback server',
			'dryui feedback ui'
		]);
	}
}

function feedbackServerHelp(): never {
	printCommandHelp({
		usage: 'dryui feedback server [--port <port>] [--host <host>] [--db <path>]',
		description: [
			'Start the DryUI feedback server in the foreground.',
			'Blocks until the server exits; use Ctrl-C to stop it.'
		],
		options: [
			'  --port <port>   Listen on this TCP port (default 4748)',
			'  --host <host>   Listen on this host (default 127.0.0.1)',
			'  --db <path>     Override the SQLite store path'
		],
		examples: [
			'  dryui feedback server',
			'  dryui feedback server --port 5757',
			'  dryui feedback server --host 0.0.0.0 --db ~/.dryui-feedback/local.db'
		]
	});
}

function feedbackUiHelp(): never {
	printCommandHelp(
		{
			usage:
				'dryui feedback ui [--endpoint <url>] [--no-open] [--host <host>] [--port <port>] [--db <path>]',
			description: [
				'Open the feedback dashboard for queue and history review.',
				'If no feedback server is running at the target endpoint, this command starts one in the background first.'
			],
			options: [
				'  --endpoint <url>  Feedback server base URL',
				'  --no-open         Print the dashboard URL without opening a browser',
				'  --host <host>     Host to use when starting the server',
				'  --port <port>     Port to use when starting the server',
				'  --db <path>       SQLite database path to use when starting the server'
			],
			examples: [
				'  dryui feedback ui',
				'  dryui feedback ui --endpoint http://127.0.0.1:4748 --no-open',
				'  dryui feedback ui --port 5757 --db ~/.dryui-feedback/preview.db'
			]
		},
		0
	);
}

function resolveServerLaunchArgs(
	args: string[],
	client: FeedbackHttpClient
): { host?: string; port: number; db?: string } {
	const host = getFlag(args, '--host');
	const db = getFlag(args, '--db');
	const explicitPort = getFlag(args, '--port');

	if (explicitPort || host) {
		return {
			...(host ? { host } : {}),
			port: parsePort(explicitPort, DEFAULT_FEEDBACK_PORT),
			...(db ? { db } : {})
		};
	}

	try {
		const url = new URL(client.baseUrl);
		return {
			host: url.hostname,
			port: parsePort(url.port || undefined, DEFAULT_FEEDBACK_PORT),
			...(db ? { db } : {})
		};
	} catch {
		return {
			port: DEFAULT_FEEDBACK_PORT,
			...(db ? { db } : {})
		};
	}
}

function resolveUiEndpoint(args: string[]): string | undefined {
	const endpoint = getFlag(args, '--endpoint');
	if (endpoint) return endpoint;

	const host = getFlag(args, '--host');
	const port = getFlag(args, '--port');
	if (!host && !port) return undefined;

	return toFeedbackBaseUrl(host ?? DEFAULT_FEEDBACK_HOST, parsePort(port, DEFAULT_FEEDBACK_PORT));
}

function startFeedbackServerInBackground(args: string[], client: FeedbackHttpClient): void {
	const launch = resolveServerLaunchArgs(args, client);
	spawnFeedbackServerInBackground({
		entry: resolveServerEntry(),
		port: launch.port,
		...(launch.host ? { host: launch.host } : {}),
		...(launch.db ? { db: launch.db } : {})
	});
}

async function runFeedbackUi(args: string[]): Promise<void> {
	if (hasFlag(args, '--help')) {
		feedbackUiHelp();
	}

	const buildResult = ensureFeedbackUiBuilt({ workspaceRoot: REPO_ROOT });
	if (buildResult) {
		runCommand(buildResult);
		return;
	}

	const endpoint = resolveUiEndpoint(args);
	const noOpen = hasFlag(args, '--no-open');
	const client = new FeedbackHttpClient(endpoint);

	let serverMessage: string;
	try {
		serverMessage = await ensureUrlReady(
			`${client.baseUrl}/health`,
			() => startFeedbackServerInBackground(args, client),
			`Unable to start the feedback server at ${client.baseUrl}.`
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		runCommand(commandError('toon', 'feedback-ui-failed', message), 'toon');
		return;
	}

	const uiLaunchUrl = `${client.baseUrl}/ui?v=${Date.now()}`;
	const opened = noOpen ? false : openBrowser(uiLaunchUrl);

	runCommand({
		output: [
			'DryUI feedback ui',
			'',
			`Endpoint: ${client.baseUrl}`,
			`Dashboard: ${uiLaunchUrl}`,
			`Server: ${serverMessage}`,
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
	});
}

function runFeedbackServer(args: string[]): never {
	if (hasFlag(args, '--help')) {
		feedbackServerHelp();
	}

	const entry = resolveServerEntry();
	const port = parsePort(getFlag(args, '--port'), DEFAULT_FEEDBACK_PORT);
	const host = getFlag(args, '--host');
	const db = getFlag(args, '--db');
	const commandArgs = ['run', entry, '--port', String(port)];

	if (host) commandArgs.push('--host', host);
	if (db) commandArgs.push('--db', db);

	const result = spawnSync('bun', commandArgs, {
		stdio: 'inherit'
	});

	process.exit(result.status ?? 0);
}

function feedbackDispatcherHelp(): never {
	printCommandHelp({
		usage: 'dryui feedback <subcommand> [options]',
		description: ['Start feedback tooling, inspect the server, or launch the dashboard.'],
		options: [
			'  server    Run the feedback server in the foreground',
			'  init      Print the recommended feedback setup for this machine',
			'  doctor    Probe a running feedback server for health + listener stats',
			'  ui        Open the feedback dashboard in a browser'
		],
		examples: [
			'  dryui feedback server',
			'  dryui feedback ui --no-open',
			'  dryui feedback doctor --endpoint http://127.0.0.1:5757'
		]
	});
}

function emitUnknownFeedbackSubcommand(name: string | undefined): void {
	const code = name ? 'unknown-subcommand' : 'missing-subcommand';
	const base = name
		? `Unknown feedback subcommand: "${name}". Run \`dryui feedback --help\` for the list.`
		: 'Missing feedback subcommand. Run `dryui feedback --help` for the list.';
	runCommand(
		commandError('toon', code, base, [
			'dryui feedback --help',
			'dryui feedback ui',
			'dryui feedback server'
		]),
		'toon'
	);
}

export async function runFeedback(args: string[]): Promise<void> {
	const command = args[0];

	if (command === '--help' || command === '-h') {
		feedbackDispatcherHelp();
	}

	if (!command) {
		emitUnknownFeedbackSubcommand(undefined);
		return;
	}

	if (command === 'server') {
		runFeedbackServer(args.slice(1));
		return;
	}

	if (command === 'init') {
		if (hasFlag(args.slice(1), '--help')) {
			feedbackInitHelp();
		}
		runCommand(getFeedbackInit(), 'toon');
		return;
	}

	if (command === 'doctor') {
		if (hasFlag(args.slice(1), '--help')) {
			feedbackDoctorHelp();
		}
		runCommand(await getFeedbackDoctor(args.slice(1)), 'toon');
		return;
	}

	if (command === 'ui') {
		await runFeedbackUi(args.slice(1));
		return;
	}

	emitUnknownFeedbackSubcommand(command);
}
