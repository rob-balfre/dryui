// Shared command output handler for all CLI commands.

import { existsSync, readFileSync } from 'node:fs';
import { toonError } from '@dryui/mcp/toon';

export interface CommandResult {
	output: string;
	error: string | null;
	exitCode: number;
}

export type OutputMode = 'text' | 'json' | 'toon';

export interface CommandResultRenderers<T> {
	toon: (value: T) => string;
	json?: (value: T) => string;
	text: (value: T) => string;
}

export interface CommandHelp {
	usage: string;
	description: readonly string[];
	options?: readonly string[];
	examples?: readonly string[];
}

export interface StandardCommandContext {
	args: string[];
	mode: OutputMode;
	positionals: string[];
}

export interface StandardCommandOptions {
	help: CommandHelp;
	allowJson?: boolean;
	minPositionals?: number;
	execute: (context: StandardCommandContext) => CommandResult;
}

/**
 * Resolve output mode from a flag list. TOON is the default for every CLI
 * command; `--text` opts into plain text, `--json` opts into JSON where the
 * command supports it. Pass `allowJson: false` for commands that do not
 * produce JSON output (e.g. info, list, compose, tokens, doctor) — `--json`
 * is then ignored rather than silently downgrading the command to plain text.
 */
export function resolveOutputMode(
	args: readonly string[],
	allowJson = true
): { mode: OutputMode; toon: boolean; json: boolean; text: boolean } {
	const text = args.includes('--text');
	const json = allowJson && args.includes('--json');
	const toon = !text && !json;
	return {
		mode: toon ? 'toon' : json ? 'json' : 'text',
		toon,
		json,
		text
	};
}

export function printCommandHelp(help: CommandHelp, exitCode = 0): never {
	console.log(`Usage: ${help.usage}`);
	console.log('');

	for (const line of help.description) {
		console.log(line);
	}

	if (help.options?.length) {
		console.log('');
		console.log('Options:');
		for (const line of help.options) {
			console.log(line);
		}
	}

	if (help.examples?.length) {
		console.log('');
		console.log('Examples:');
		for (const line of help.examples) {
			console.log(line);
		}
	}

	process.exit(exitCode);
}

export function runStandardCommand(args: string[], options: StandardCommandOptions): void {
	if (args[0] === '--help') {
		printCommandHelp(options.help, 0);
	}

	const positionals = args.filter((arg) => !arg.startsWith('--'));
	const minPositionals = options.minPositionals ?? 0;

	if (positionals.length < minPositionals) {
		printCommandHelp(options.help, 1);
	}

	const { mode } = resolveOutputMode(args, options.allowJson ?? true);
	runCommand(options.execute({ args, mode, positionals }), mode);
}

/**
 * Return a CommandResult for a missing file, or null if the file exists.
 * Formats the error as TOON when mode is 'toon'.
 */
export function fileNotFound(filePath: string, mode: OutputMode): CommandResult | null {
	if (existsSync(filePath)) return null;
	return {
		output: '',
		error:
			mode === 'toon'
				? toonError('not-found', `File not found: ${filePath}`)
				: `File not found: ${filePath}`,
		exitCode: 1
	};
}

/**
 * Render a value into a command result based on the selected output mode.
 */
export function renderCommandResultByMode<T>(
	mode: OutputMode,
	value: T,
	renderers: CommandResultRenderers<T>,
	exitCode = 0
): CommandResult {
	switch (mode) {
		case 'toon':
			return { output: renderers.toon(value), error: null, exitCode };
		case 'json':
			return {
				output: renderers.json ? renderers.json(value) : JSON.stringify(value, null, 2),
				error: null,
				exitCode
			};
		case 'text':
		default:
			return { output: renderers.text(value), error: null, exitCode };
	}
}

/**
 * Read a file command input after validating that the file exists.
 */
export function runFileCommand(
	filePath: string,
	mode: OutputMode,
	run: (contents: string) => CommandResult
): CommandResult {
	const missing = fileNotFound(filePath, mode);
	if (missing) return missing;
	return run(readFileSync(filePath, 'utf-8'));
}

/**
 * Print a command result and exit.
 * In toon/json mode: errors go to stdout (agent-friendly structured output).
 * In text mode: errors go to stderr (human-friendly).
 */
export function runCommand(result: CommandResult, mode: OutputMode = 'text'): void {
	if (result.error) {
		if (mode === 'text') {
			console.error(result.error);
		} else {
			// Agent mode: errors on stdout so agents can read them
			console.log(result.error);
		}
	} else {
		console.log(result.output);
	}

	process.exit(result.exitCode);
}
