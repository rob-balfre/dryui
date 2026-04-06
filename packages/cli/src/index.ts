#!/usr/bin/env node
// @dryui/cli — Command-line tools for DryUI

import pkg from '../package.json';
import spec from '../../mcp/src/spec.json';
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
  detect [--json] [path]        Detect DryUI project setup
  install [--json] [path]       Print a project install plan
  add <component>               Print a copyable starter snippet for a component
  info <component>              Show component API reference
  list [--category <cat>]       List all components
  compose <query>               Look up composition guidance
  review [--json] <file.svelte> Validate a Svelte file against DryUI spec
  diagnose [--json] <file.css>  Validate theme CSS
  doctor [path] [--include <glob>] [--exclude <glob>] [--changed]
                                Inspect workspace health
  lint [path] [--json] [--include <glob>] [--exclude <glob>] [--max-severity <level>] [--changed]
                                Print deterministic workspace findings
  feedback <subcommand>         Start or inspect the feedback server

Options:
  --help                  Show help for a command
  --version               Show version`;

function main(): void {
	const args = process.argv.slice(2);
	const command = args[0];

	if (!command || command === '--help' || command === '-h') {
		console.log(USAGE);
		process.exit(0);
	}

	if (command === '--version' || command === '-v') {
		console.log(VERSION);
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
