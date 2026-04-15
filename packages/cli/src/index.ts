#!/usr/bin/env node
// @dryui/cli — Command-line tools for DryUI

import { fileURLToPath } from 'node:url';
import pkg from '../package.json';
import spec from '../../mcp/src/spec.json';
import { detectProject } from '../../mcp/src/project-planner.js';
import { toonProjectDetection } from '@dryui/mcp/toon';
import { commandError, homeRelative, isInteractiveTTY, runCommand } from './run.js';
import { runAdd } from './commands/add.js';
import { runDetect } from './commands/detect.js';
import { runInstall } from './commands/install.js';
import { runInfo } from './commands/info.js';
import { runInit } from './commands/init.js';
import { runList } from './commands/list.js';
import { runReview } from './commands/review.js';
import { runDiagnose } from './commands/diagnose.js';
import { runCompose } from './commands/compose.js';
import { runDoctor } from './commands/doctor.js';
import { runLint } from './commands/lint.js';
import { runTokens } from './commands/tokens.js';
import { runFeedback } from './commands/feedback.js';
import { runLauncher } from './commands/launcher.js';
import { runInstallHook } from './commands/install-hook.js';
import { emitAmbient } from './commands/ambient.js';
import { runSetup } from './commands/setup.js';

const VERSION = pkg.version;
const DESCRIPTION = 'DryUI — zero-dependency Svelte 5 components + agent-ergonomic CLI.';

function resolveExePath(): string {
	const rawExe = process.argv[1] ?? fileURLToPath(import.meta.url);
	return homeRelative(rawExe);
}

function printBanner(): void {
	console.log(`dryui: v${VERSION}`);
	console.log(`exe: ${resolveExePath()}`);
	console.log(`about: ${DESCRIPTION}`);
	console.log('');
}

function emitNotADryuiProject(): void {
	console.log(`project: not-a-dryui-project | cwd: ${homeRelative(process.cwd())}`);
	console.log('deps: ui=false, primitives=false, lint=false');
	console.log('');
	console.log('next[4]{cmd,description}:');
	console.log('  dryui setup,Open the interactive editor + feedback setup flow');
	console.log('  dryui init,Bootstrap a new SvelteKit + DryUI project in this folder');
	console.log('  dryui install .,Print an install plan for the current folder');
	console.log('  dryui detect,Re-run detection with --text or --json output');
}

const USAGE = `Usage: dryui <command> [options]

Most commands default to TOON (token-optimized) output. Pass --text for
human-readable plain text, or --json where supported. init, feedback, and
add (snippet mode) always produce plain text.

Running \`dryui\` with no command opens the feedback launcher inside the
DryUI monorepo, prints a compact project dashboard in a DryUI project, or
starts the interactive setup flow everywhere else. Use \`dryui --help\` to
see this message.

Commands:
  setup [--editor <id>] [--open-feedback]
                                Interactive editor + feedback setup
  init [path] [--pm bun|npm|pnpm|yarn]
                                Bootstrap a SvelteKit + DryUI project
  detect [--json] [--text] [path]
                                Detect DryUI project setup
  install [--json] [--text] [path]
                                Print a project install plan
  add <component>               Print a copyable starter snippet for a component
  info <component> [--text]     Show component API reference
  list [--category <cat>] [--text]
                                List all components
  compose <query> [--text]      Look up composition guidance
  review [--json] [--text] <file.svelte>
                                Validate a Svelte file against DryUI spec
  diagnose [--json] [--text] <file.css>
                                Validate theme CSS
  doctor [path] [--text] [--include <glob>] [--exclude <glob>] [--changed]
                                Inspect workspace health
  lint [path] [--json] [--text] [--include <glob>] [--exclude <glob>] [--changed]
                                Print deterministic workspace findings
  tokens [--category <cat>] [--text]
                                List --dry-* CSS design tokens
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
		process.exit(0);
	}

	if (command === '--help' || command === '-h') {
		console.log(USAGE);
		process.exit(0);
	}

	if (!command) {
		if (await runLauncher([])) {
			return;
		}

		try {
			const detection = detectProject(spec, undefined);
			if (detection.status === 'ready' || detection.status === 'partial') {
				printBanner();
				console.log(toonProjectDetection(detection));
				process.exit(0);
			}
		} catch {
			// Detection threw — fall through to the not-a-project status.
		}

		if (isInteractiveTTY()) {
			await runSetup([]);
			return;
		}

		printBanner();
		emitNotADryuiProject();
		process.exit(0);
	}

	const commandArgs = args.slice(1);

	switch (command) {
		case 'init':
			runInit(commandArgs, spec);
			break;
		case 'setup':
			await runSetup(commandArgs);
			break;
		case 'detect':
			runDetect(commandArgs, spec);
			break;
		case 'install':
			runInstall(commandArgs, spec);
			break;
		case 'add':
			runAdd(commandArgs, spec);
			break;
		case 'info':
			runInfo(commandArgs, spec);
			break;
		case 'list':
			runList(commandArgs, spec);
			break;
		case 'review':
			runReview(commandArgs, spec);
			break;
		case 'diagnose':
			runDiagnose(commandArgs, spec);
			break;
		case 'doctor':
			runDoctor(commandArgs, spec);
			break;
		case 'lint':
			runLint(commandArgs, spec);
			break;
		case 'compose':
			runCompose(commandArgs, spec);
			break;
		case 'tokens':
			runTokens(commandArgs);
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
					['dryui --help', 'dryui list', 'dryui detect']
				),
				'toon'
			);
	}
}

void main();
