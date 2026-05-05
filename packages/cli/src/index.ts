#!/usr/bin/env node
// @dryui/cli — Command-line tools for DryUI

import { fileURLToPath } from 'node:url';
import pkg from '../package.json';
import { commandError, homeRelative, isInteractiveTTY, runCommand } from './run.js';
import { runFeedback } from './commands/feedback.js';
import { runLauncher } from './commands/launcher.js';
import { runInstallHook } from './commands/install-hook.js';
import { emitAmbient } from './commands/ambient.js';
import { runSetup } from './commands/setup.js';

const VERSION = pkg.version;
const DESCRIPTION = 'DryUI — human-led, agent-assisted UI for web app teams.';

function resolveExePath(): string {
	const rawExe = process.argv[1] ?? fileURLToPath(import.meta.url);
	return homeRelative(rawExe);
}

function isDryuiDevMode(): boolean {
	const flag = process.env['DRYUI_DEV'];
	return flag === '1' || flag === 'true';
}

function printDevModeBanner(): void {
	if (!isDryuiDevMode()) return;
	const RESET = '\x1b[0m';
	const BG = '\x1b[1m\x1b[30m\x1b[48;5;221m';
	const FG = '\x1b[38;5;221m';
	console.log(`${BG} ⚠  DRYUI_DEV=1 — LOCAL SOURCE MODE ${RESET}`);
	console.log(
		`${FG}Running from packages/*/src/, not dist/. Set DRYUI_DEV=0 to force the published path.${RESET}`
	);
	console.log('');
}

function printBanner(): void {
	console.log(`dryui: v${VERSION}`);
	console.log(`exe: ${resolveExePath()}`);
	console.log(`about: ${DESCRIPTION}`);
	console.log('');
	printDevModeBanner();
}

function emitNotADryuiProject(): void {
	console.log(`cwd: ${homeRelative(process.cwd())}`);
	console.log('');
	console.log('next[2]{cmd,description}:');
	console.log('  npx skills add rob-balfre/dryui,Install DryUI skills');
	console.log('  dryui feedback,Open the feedback dashboard');
}

const USAGE = `Usage: dryui <command> [options]

DryUI's CLI is intentionally small. Product guidance and project inspection
live in skills; the CLI only runs feedback tooling.

Running \`dryui\` with no command opens the setup deprecation notice in a TTY.
Without a TTY, it opens the feedback launcher inside the DryUI monorepo or
prints setup hints everywhere else. Use \`dryui --help\` to see this message.

Commands:
  setup                         Deprecated; use \`npx skills add rob-balfre/dryui\`
  ambient                       Print compact session context (for SessionStart hooks)
  install-hook [--global] [--dry-run]
                                Wire \`dryui ambient\` into Claude Code settings.json
  feedback <subcommand>         Start feedback tooling, inspect the server, or launch the dashboard

Options:
  --help                  Show help for a command
  --version               Show version
  --text                  Plain-text output for humans (default is TOON)
  --json                  JSON output (where supported)
  --full                  Disable truncation`;

async function main(): Promise<void> {
	const args = process.argv.slice(2);
	const command = args[0];

	if (command === '--version' || command === '-v') {
		console.log(VERSION);
		printDevModeBanner();
		process.exit(0);
	}

	if (command === '--help' || command === '-h') {
		printDevModeBanner();
		console.log(USAGE);
		process.exit(0);
	}

	if (!command) {
		if (isInteractiveTTY()) {
			await runSetup([]);
			return;
		}

		if (await runLauncher([])) {
			return;
		}

		printBanner();
		emitNotADryuiProject();
		process.exit(0);
	}

	const commandArgs = args.slice(1);

	switch (command) {
		case 'setup':
			await runSetup(commandArgs);
			break;
		case 'ambient':
			emitAmbient();
			break;
		case 'install-hook':
			runInstallHook(commandArgs);
			break;
		case 'feedback':
			await runFeedback(commandArgs);
			break;
		default:
			runCommand(
				commandError(
					'toon',
					'unknown-command',
					`Unknown command: "${command}". Run \`dryui --help\` for the full command list.`,
					['dryui --help', 'npx skills add rob-balfre/dryui', 'dryui feedback']
				),
				'toon'
			);
	}
}

void main();
