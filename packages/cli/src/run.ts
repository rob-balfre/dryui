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
 * Return a CommandResult for a missing file, or null if the file exists.
 * Formats the error as TOON when toon mode is active.
 */
export function fileNotFound(filePath: string, toon?: boolean): CommandResult | null {
	if (existsSync(filePath)) return null;
	return {
		output: '',
		error: toon
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
