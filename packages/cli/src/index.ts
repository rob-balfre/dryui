#!/usr/bin/env node
// @dryui/cli — Command-line tools for DryUI

import pkg from '../package.json';
import spec from '../../mcp/src/spec.json';
import { detectProject } from '../../mcp/src/project-planner.js';
import { toonProjectDetection } from '@dryui/mcp/toon';
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

const VERSION = pkg.version;

const USAGE = `Usage: dryui <command> [options]

Most commands default to TOON (token-optimized) output. Pass --text for
human-readable plain text, or --json where supported. init, feedback, and
add (snippet mode) always produce plain text.

In this repository, running \`dryui\` with no command opens the feedback dashboard.

Commands:
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

	// In the DryUI repo, no-arg opens the feedback dashboard. Else keep the existing status/help flow.
	if (!command) {
		if (await runLauncher([])) {
			return;
		}

		try {
			const detection = detectProject(spec, undefined);
			if (detection.status === 'ready' || detection.status === 'partial') {
				console.log(`dryui v${VERSION}\n`);
				console.log(toonProjectDetection(detection));
				process.exit(0);
			}
		} catch {
			// Not in a project — fall through to USAGE
		}
		console.log(USAGE);
		process.exit(0);
	}

	const commandArgs = args.slice(1);

	switch (command) {
		case 'init':
			runInit(commandArgs, spec);
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
		case 'feedback':
			await runFeedback(commandArgs);
			break;
		default:
			console.error(`Unknown command: "${command}"`);
			console.error('');
			console.error(USAGE);
			process.exit(1);
	}
}

void main();
