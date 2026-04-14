// dryui doctor [path] — Inspect workspace health with human-readable findings

import { scanWorkspace } from '@dryui/mcp/workspace-audit';
import type { Spec } from './types.js';
import { formatWorkspaceReport } from '../format.js';
import { toonWorkspaceReport } from '@dryui/mcp/toon';
import { parseWorkspaceArgs } from './workspace-args.js';
import {
	commandError,
	renderCommandResultByMode,
	runCommand,
	type CommandResult,
	type OutputMode
} from '../run.js';

export function getDoctor(
	inputPath: string | undefined,
	spec: Spec,
	mode: OutputMode,
	options: {
		include?: readonly string[];
		exclude?: readonly string[];
		maxSeverity?: 'error' | 'warning' | 'info';
		changed?: boolean;
		full?: boolean;
	} = {}
): CommandResult {
	try {
		const report = scanWorkspace(spec, {
			...(inputPath ? { cwd: inputPath } : {}),
			...(options.include ? { include: options.include } : {}),
			...(options.exclude ? { exclude: options.exclude } : {}),
			...(options.maxSeverity ? { maxSeverity: options.maxSeverity } : {}),
			...(options.changed === undefined ? {} : { changed: options.changed })
		});
		return renderCommandResultByMode(
			mode,
			report,
			{
				toon: (value) =>
					toonWorkspaceReport(value, {
						title: 'doctor',
						command: 'doctor',
						full: options.full
					}),
				text: (value) =>
					formatWorkspaceReport(value, {
						title: 'DryUI workspace doctor',
						showSkipped: true,
						summaryLabel: 'Findings'
					})
			},
			0
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		// ENOENT and missing-path errors from scanWorkspace should look like
		// other "not-found" errors so agents can parse them consistently.
		const isMissing =
			/ENOENT|no such file|not found|does not exist/i.test(message) ||
			(typeof error === 'object' &&
				error !== null &&
				(error as { code?: string }).code === 'ENOENT');
		return commandError(mode, isMissing ? 'not-found' : 'scan-failed', message);
	}
}

export function runDoctor(args: string[], spec: Spec): void {
	if (args[0] === '--help') {
		console.log(
			'Usage: dryui doctor [path] [--text] [--full] [--include <glob>] [--exclude <glob>] [--max-severity <level>] [--changed]'
		);
		console.log('');
		console.log('Inspect workspace health.');
		console.log('');
		console.log('Options:');
		console.log('  --text    Plain-text output for humans (default is TOON)');
		console.log('  --full    Show all findings (disables truncation at 50)');
		process.exit(0);
	}

	const { path, mode, options } = parseWorkspaceArgs(args, { allowJson: false });
	runCommand(getDoctor(path, spec, mode, options), mode);
}
