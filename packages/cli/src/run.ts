// Shared command output handler for all CLI commands.

import { existsSync } from 'node:fs';
import { toonError } from '@dryui/mcp/toon';

export interface CommandResult {
	output: string;
	error: string | null;
	exitCode: number;
}

export type OutputMode = 'text' | 'json' | 'toon';

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
