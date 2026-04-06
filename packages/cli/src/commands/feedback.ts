import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	DEFAULT_FEEDBACK_PORT,
	DEFAULT_STORE_PATH,
	FeedbackHttpClient,
	parsePort
} from '@dryui/feedback-server';
import { runCommand, type CommandResult } from '../run.js';

const COMMANDS_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(COMMANDS_DIR, '..', '..', '..', '..');
const SERVER_DIST_PATH = resolve(REPO_ROOT, 'packages/feedback-server/dist/server.js');
const SERVER_SRC_PATH = resolve(REPO_ROOT, 'packages/feedback-server/src/server.ts');

function usage(): string {
	return [
		'Usage: dryui feedback <command> [options]',
		'',
		'Commands:',
		'  server [--port 4748] [--host 127.0.0.1] [--db <path>]',
		'  init',
		'  doctor [--endpoint <url>]'
	].join('\n');
}

function resolveServerEntry(): string {
	if (existsSync(SERVER_DIST_PATH)) return SERVER_DIST_PATH;
	return SERVER_SRC_PATH;
}

function getFlag(args: string[], name: string): string | undefined {
	const index = args.indexOf(name);
	if (index === -1) return undefined;
	return args[index + 1];
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
			'3. Register the hook script with your prompt-submit hook if you want pending annotations injected into context.'
		].join('\n'),
		error: null,
		exitCode: 0
	};
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
		return {
			output: '',
			error: error instanceof Error ? error.message : String(error),
			exitCode: 1
		};
	}
}

function runFeedbackServer(args: string[]): never {
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

export async function runFeedback(args: string[]): Promise<void> {
	const command = args[0];
	if (!command || command === '--help') {
		console.log(usage());
		process.exit(command === '--help' ? 0 : 1);
	}

	if (command === 'server') {
		runFeedbackServer(args.slice(1));
	}

	if (command === 'init') {
		runCommand(getFeedbackInit());
		return;
	}

	if (command === 'doctor') {
		runCommand(await getFeedbackDoctor(args.slice(1)));
		return;
	}

	console.error(usage());
	process.exit(1);
}
