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
import { runFeedback } from './commands/feedback.js';

const VERSION = pkg.version;

const USAGE = `Usage: dryui <command> [options]

Commands:
  init                          Print setup snippets for a new DryUI app
  detect [--json] [--toon] [path]
                                Detect DryUI project setup
  install [--json] [--toon] [path]
                                Print a project install plan
  add <component>               Print a copyable starter snippet for a component
  info <component> [--toon]     Show component API reference
  list [--category <cat>] [--toon]
                                List all components
  compose <query> [--toon]      Look up composition guidance
  review [--json] [--toon] <file.svelte>
                                Validate a Svelte file against DryUI spec
  diagnose [--json] [--toon] <file.css>
                                Validate theme CSS
  doctor [path] [--toon] [--include <glob>] [--exclude <glob>] [--changed]
                                Inspect workspace health
  lint [path] [--json] [--toon] [--include <glob>] [--exclude <glob>] [--changed]
                                Print deterministic workspace findings
  feedback <subcommand>         Start or inspect the feedback server

Options:
  --help                  Show help for a command
  --version               Show version
  --toon                  Token-optimized output for AI agents (per-command)
  --full                  Disable truncation (use with --toon)`;

function main(): void {
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

	// Content-first: no-arg shows project status if in a DryUI project, otherwise USAGE
	if (!command) {
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
		case 'feedback':
			void runFeedback(commandArgs);
			break;
		default:
			console.error(`Unknown command: "${command}"`);
			console.error('');
			console.error(USAGE);
			process.exit(1);
	}
}

main();
