// Shared command output handler for all CLI commands.

export interface CommandResult {
	output: string;
	error: string | null;
	exitCode: number;
}

/**
 * Print a command result and exit.
 * Errors go to stderr, normal output to stdout.
 */
export function runCommand(result: CommandResult): void {
	if (result.error) {
		console.error(result.error);
	} else {
		console.log(result.output);
	}

	process.exit(result.exitCode);
}
