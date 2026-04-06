#!/usr/bin/env bun
import { spawn } from 'node:child_process';
import { createWizardServer } from './server.js';
import type { WizardRuntimeEvent, WizardQuestionInput } from './types.js';

interface ParsedCommand {
	command: 'start' | 'ask' | 'done' | 'help' | 'version';
	port?: number;
	question?: string;
}

function printJsonLine(payload: WizardRuntimeEvent | Record<string, unknown>): void {
	process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function parseArgs(argv: readonly string[]): ParsedCommand {
	const [command = 'help', ...rest] = argv;

	if (command === '--help' || command === '-h') {
		return { command: 'help' };
	}

	if (command === '--version' || command === '-v') {
		return { command: 'version' };
	}

	if (command === 'ask' || command === 'done') {
		let port: number | undefined;
		let question: string | undefined;

		for (let index = 0; index < rest.length; index += 1) {
			const token = rest[index];
			if (token === '--port') {
				const value = rest[index + 1];
				if (!value) {
					throw new Error('--port requires a value.');
				}

				port = Number(value);
				index += 1;
				continue;
			}

			if (token === '--question') {
				const value = rest[index + 1];
				if (!value) {
					throw new Error('--question requires a value.');
				}

				question = value;
				index += 1;
			}
		}

		const parsed: ParsedCommand = { command };
		if (port !== undefined) {
			parsed.port = port;
		}
		if (question !== undefined) {
			parsed.question = question;
		}
		return parsed;
	}

	return { command: command as ParsedCommand['command'] };
}

function usage(): string {
	return [
		'Usage: dryui-wizard <command>',
		'',
		'Commands:',
		'  start                    Start the wizard server and open the browser',
		'  ask --port <port> --question <json>',
		'  done --port <port>',
		'',
		'Options:',
		'  --help                   Show help',
		'  --version                Show version'
	].join('\n');
}

function openBrowser(url: string): void {
	if (process.platform !== 'darwin') {
		return;
	}

	try {
		const child = spawn('open', [url], {
			detached: true,
			stdio: 'ignore'
		});
		child.unref();
	} catch {
		// Ignore browser launch failures.
	}
}

function resolvePackageVersion(): string {
	return '0.0.1';
}

async function runStart(): Promise<void> {
	let closeResolver: (() => void) | null = null;
	const closed = new Promise<void>((resolve) => {
		closeResolver = resolve;
	});

	const handle = createWizardServer({
		onEvent(event) {
			printJsonLine(event);
			if (event.type === 'closed') {
				closeResolver?.();
			}
		}
	});

	printJsonLine({ type: 'started', port: handle.port, url: handle.url });
	openBrowser(handle.url);

	const handleSignal = (): void => {
		handle.stop();
	};

	process.once('SIGINT', handleSignal);
	process.once('SIGTERM', handleSignal);

	await closed;
}

async function runAsk(port: number | undefined, question: string | undefined): Promise<void> {
	if (!port || Number.isNaN(port)) {
		throw new Error('A valid --port value is required.');
	}

	if (!question) {
		throw new Error('--question is required.');
	}

	const parsed = JSON.parse(question) as WizardQuestionInput;
	const response = await fetch(`http://127.0.0.1:${port}/api/ask`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json; charset=utf-8'
		},
		body: JSON.stringify(parsed)
	});

	if (!response.ok) {
		throw new Error(`Wizard ask failed with status ${response.status}.`);
	}

	const answer = (await response.json()) as Record<string, unknown>;
	printJsonLine(answer);
}

async function runDone(port: number | undefined): Promise<void> {
	if (!port || Number.isNaN(port)) {
		throw new Error('A valid --port value is required.');
	}

	const response = await fetch(`http://127.0.0.1:${port}/api/done`, { method: 'POST' });
	if (!response.ok) {
		throw new Error(`Wizard done failed with status ${response.status}.`);
	}

	printJsonLine({ type: 'closed' });
}

async function main(): Promise<void> {
	try {
		const parsed = parseArgs(process.argv.slice(2));

		switch (parsed.command) {
			case 'help':
				console.log(usage());
				return;
			case 'version':
				console.log(resolvePackageVersion());
				return;
			case 'start':
				await runStart();
				return;
			case 'ask':
				await runAsk(parsed.port, parsed.question);
				return;
			case 'done':
				await runDone(parsed.port);
				return;
			default:
				console.error(usage());
				process.exitCode = 1;
				return;
		}
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		process.exitCode = 1;
	}
}

void main();
