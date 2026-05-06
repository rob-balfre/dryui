import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FeedbackHttpClient, parsePort } from '../client.js';
import {
	DEFAULT_FEEDBACK_HOST,
	DEFAULT_FEEDBACK_PORT,
	readFeedbackServerConfig,
	toFeedbackBaseUrl
} from '../config.js';
import { runDoctor } from './doctor.js';
import {
	ensureFeedbackUiBuilt,
	ensureUrlReady,
	findWorkspaceRoot,
	openBrowser,
	resolveFeedbackServerEntry,
	spawnFeedbackServerInBackground
} from './launch-dashboard.js';

interface ParsedArgs {
	flags: Set<string>;
	values: Map<string, string>;
	positionals: string[];
}

/**
 * Inline argv parser. Supports `--flag`, `--key value`, and `--key=value`.
 * Unknown flags/values pass through into ParsedArgs verbatim so callers can
 * decide whether to error on them.
 */
function parseArgs(argv: readonly string[]): ParsedArgs {
	const flags = new Set<string>();
	const values = new Map<string, string>();
	const positionals: string[] = [];

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === undefined) continue;

		if (arg.startsWith('--')) {
			const eq = arg.indexOf('=');
			if (eq !== -1) {
				values.set(arg.slice(0, eq), arg.slice(eq + 1));
				continue;
			}
			const next = argv[i + 1];
			if (next !== undefined && !next.startsWith('--')) {
				values.set(arg, next);
				flags.add(arg);
				i += 1;
			} else {
				flags.add(arg);
			}
			continue;
		}

		positionals.push(arg);
	}

	return { flags, values, positionals };
}

function hasFlag(args: ParsedArgs, name: string): boolean {
	return args.flags.has(name) || args.values.has(name);
}

function getFlag(args: ParsedArgs, name: string): string | undefined {
	return args.values.get(name);
}

function readPackageVersion(): string {
	try {
		const here = dirname(fileURLToPath(import.meta.url));
		// src/cli/index.ts → ../../package.json; dist/cli/index.js → ../../package.json
		const pkgPath = resolve(here, '..', '..', 'package.json');
		const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { version?: string };
		return pkg.version ?? '0.0.0';
	} catch {
		return '0.0.0';
	}
}

function printTopLevelHelp(): void {
	const lines = [
		'Usage: dryui-feedback [command] [options]',
		'',
		'Open the DryUI feedback dashboard for queue and history review.',
		'With no command, starts the feedback server (if needed) and opens the dashboard.',
		'',
		'Commands:',
		'  (default)   Open the feedback dashboard in a browser',
		'  server      Run the feedback server in the foreground',
		'  doctor      Probe a running feedback server for health and listener stats',
		'',
		'Options:',
		'  --endpoint <url>  Feedback server base URL',
		'  --no-open         Print the dashboard URL without opening a browser',
		'  --host <host>     Host to use when starting the server',
		'  --port <port>     Port to use when starting the server',
		'  --db <path>       SQLite database path to use when starting the server',
		'  --version         Print version and exit',
		'  --help            Show this help and exit',
		'',
		'Examples:',
		'  dryui-feedback',
		'  dryui-feedback --no-open',
		'  dryui-feedback server --port 5757',
		'  dryui-feedback doctor --endpoint http://127.0.0.1:5757'
	];
	console.log(lines.join('\n'));
}

function printServerHelp(): void {
	const lines = [
		'Usage: dryui-feedback server [--port <port>] [--host <host>] [--db <path>]',
		'',
		'Start the DryUI feedback server in the foreground.',
		'Blocks until the server exits; use Ctrl-C to stop it.',
		'',
		'Options:',
		'  --port <port>   Listen on this TCP port (default 4748)',
		'  --host <host>   Listen on this host (default 127.0.0.1)',
		'  --db <path>     Override the SQLite store path',
		'  --project <path> Override the project root',
		'',
		'Examples:',
		'  dryui-feedback server',
		'  dryui-feedback server --port 5757'
	];
	console.log(lines.join('\n'));
}

function printDoctorHelp(): void {
	const lines = [
		'Usage: dryui-feedback doctor [--endpoint <url>]',
		'',
		'Probe a running feedback server for health and listener stats.',
		'Hits /health and /status at the given endpoint and prints a compact report.',
		'',
		'Options:',
		'  --endpoint <url>  Feedback server base URL (default http://127.0.0.1:4748)',
		'',
		'Examples:',
		'  dryui-feedback doctor',
		'  dryui-feedback doctor --endpoint http://127.0.0.1:5757'
	];
	console.log(lines.join('\n'));
}

function resolveServerEntry(): string {
	const workspaceRoot = findWorkspaceRoot() ?? undefined;
	return resolveFeedbackServerEntry({ workspaceRoot, preferPackaged: true });
}

function runServerCommand(args: ParsedArgs): never {
	if (hasFlag(args, '--help')) {
		printServerHelp();
		process.exit(0);
	}

	const projectRoot = getFlag(args, '--project') ?? process.cwd();
	const existingConfig = readFeedbackServerConfig(projectRoot);
	const entry = resolveServerEntry();
	const port = parsePort(getFlag(args, '--port'), existingConfig?.port ?? DEFAULT_FEEDBACK_PORT);
	const host = getFlag(args, '--host');
	const db = getFlag(args, '--db');
	const commandArgs = ['run', entry, '--port', String(port), '--project', projectRoot];

	if (host) commandArgs.push('--host', host);
	if (db) commandArgs.push('--db', db);

	const result = spawnSync('bun', commandArgs, {
		stdio: 'inherit'
	});

	process.exit(result.status ?? 0);
}

function resolveUiEndpoint(args: ParsedArgs, projectRoot: string): string | undefined {
	const endpoint = getFlag(args, '--endpoint');
	if (endpoint) return endpoint;

	const host = getFlag(args, '--host');
	const port = getFlag(args, '--port');
	if (host || port) {
		return toFeedbackBaseUrl(host ?? DEFAULT_FEEDBACK_HOST, parsePort(port, DEFAULT_FEEDBACK_PORT));
	}

	const existingConfig = readFeedbackServerConfig(projectRoot);
	return existingConfig?.baseUrl;
}

function resolveServerLaunchArgs(args: ParsedArgs, projectRoot: string) {
	const host = getFlag(args, '--host');
	const db = getFlag(args, '--db');
	const explicitPort = getFlag(args, '--port');
	const fallbackPort = readFeedbackServerConfig(projectRoot)?.port ?? DEFAULT_FEEDBACK_PORT;

	return {
		...(host ? { host } : {}),
		port: parsePort(explicitPort, fallbackPort),
		...(db ? { db } : {}),
		project: projectRoot
	};
}

async function runUiCommand(args: ParsedArgs): Promise<number> {
	if (hasFlag(args, '--help')) {
		printTopLevelHelp();
		return 0;
	}

	const workspaceRoot = findWorkspaceRoot() ?? undefined;
	const buildResult = ensureFeedbackUiBuilt({ workspaceRoot });
	if (!buildResult.ok) {
		console.error(buildResult.message ?? 'Unable to build the feedback dashboard.');
		return 1;
	}

	const projectRoot = process.cwd();
	const endpoint = resolveUiEndpoint(args, projectRoot);
	const noOpen = hasFlag(args, '--no-open');
	const client = new FeedbackHttpClient({
		...(endpoint ? { baseUrl: endpoint } : {}),
		projectRoot
	});

	let serverMessage: string;
	try {
		const launch = resolveServerLaunchArgs(args, projectRoot);
		const ready = await ensureUrlReady(
			`${client.baseUrl}/health`,
			() =>
				spawnFeedbackServerInBackground({
					entry: resolveServerEntry(),
					port: launch.port,
					...(launch.host ? { host: launch.host } : {}),
					...(launch.db ? { db: launch.db } : {}),
					project: launch.project
				}),
			`feedback server failed to start within 15s at ${client.baseUrl}. Check that port ${launch.port} is free, or pass --port to pick another.`
		);
		serverMessage = ready.message;
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		return 1;
	}

	const uiLaunchUrl = `${client.baseUrl}/ui?v=${Date.now()}`;
	const opened = noOpen ? false : openBrowser(uiLaunchUrl);

	const browserNote = noOpen
		? 'skipped (--no-open)'
		: opened
			? 'opening default browser'
			: 'could not auto-open; use the dashboard URL above';

	console.log(
		[
			'DryUI feedback ui',
			'',
			`Project: ${projectRoot}`,
			`Endpoint: ${client.baseUrl}`,
			`Dashboard: ${uiLaunchUrl}`,
			`Server: ${serverMessage}`,
			`Browser: ${browserNote}`
		].join('\n')
	);

	return 0;
}

async function runDoctorCommand(args: ParsedArgs): Promise<number> {
	if (hasFlag(args, '--help')) {
		printDoctorHelp();
		return 0;
	}

	const endpoint = getFlag(args, '--endpoint');
	const result = await runDoctor({
		...(endpoint ? { endpoint } : {}),
		projectRoot: process.cwd()
	});

	if (result.error) {
		console.error(result.error);
	} else {
		console.log(result.output);
	}
	return result.exitCode;
}

export async function main(argv: readonly string[] = process.argv.slice(2)): Promise<number> {
	const first = argv[0];

	if (first === '--version' || first === '-v') {
		console.log(readPackageVersion());
		return 0;
	}

	if (first === '--help' || first === '-h') {
		printTopLevelHelp();
		return 0;
	}

	if (first === 'server') {
		runServerCommand(parseArgs(argv.slice(1)));
		return 0;
	}

	if (first === 'doctor') {
		return runDoctorCommand(parseArgs(argv.slice(1)));
	}

	if (first === 'ui') {
		// Compatibility alias for the legacy `dryui feedback ui` form.
		return runUiCommand(parseArgs(argv.slice(1)));
	}

	if (first !== undefined && !first.startsWith('--')) {
		console.error(`Unknown command: "${first}". Run \`dryui-feedback --help\` for usage.`);
		return 1;
	}

	return runUiCommand(parseArgs(argv));
}

if (import.meta.main) {
	main()
		.then((code) => process.exit(code))
		.catch((error) => {
			console.error(error instanceof Error ? error.message : String(error));
			process.exit(1);
		});
}
