// dryui lint [path] — Print deterministic workspace findings

import { scanWorkspace } from '@dryui/mcp/workspace-audit';
import type { Spec } from './types.js';
import { formatWorkspaceReport } from '../format.js';
import { toonWorkspaceReport } from '@dryui/mcp/toon';
import { parseWorkspaceArgs } from './workspace-args.js';
import {
	renderCommandResultByMode,
	runCommand,
	type CommandResult,
	type OutputMode
} from '../run.js';

export function getLint(
	inputPath: string | undefined,
	spec: Spec,
	mode: OutputMode,
	options: {
		full?: boolean;
		include?: readonly string[];
		exclude?: readonly string[];
		maxSeverity?: 'error' | 'warning' | 'info';
		changed?: boolean;
	} = {}
): CommandResult {
	try {
		const report = scanWorkspace(spec, {
			...(inputPath ? { cwd: inputPath } : {}),
			...(options.include ? { include: options.include } : {}),
			...(options.exclude ? { exclude: options.exclude } : {}),
			...(options.changed === undefined ? {} : { changed: options.changed }),
			...(options.maxSeverity ? { maxSeverity: options.maxSeverity } : {})
		});

		const exitCode = report.findings.length > 0 ? 1 : 0;
		return renderCommandResultByMode(
			mode,
			report,
			{
				toon: (value) =>
					toonWorkspaceReport(value, {
						title: 'lint',
						command: 'lint',
						full: options.full
					}),
				json: (value) => JSON.stringify(value, null, 2),
				text: (value) =>
					formatWorkspaceReport(value, { title: 'DryUI lint', summaryLabel: 'Issues' })
			},
			exitCode
		);
	} catch (error) {
		return {
			output: '',
			error: error instanceof Error ? error.message : String(error),
			exitCode: 1
		};
	}
}

export function runLint(args: string[], spec: Spec): void {
	if (args[0] === '--help') {
		console.log(
			'Usage: dryui lint [path] [--json] [--text] [--full] [--include <glob>] [--exclude <glob>] [--max-severity <level>] [--changed]'
		);
		console.log('');
		console.log('Print deterministic workspace findings.');
		console.log('');
		console.log('Options:');
		console.log('  --text    Plain-text output for humans (default is TOON)');
		console.log('  --json    Output raw JSON instead');
		console.log('  --full    Show all findings (disables truncation at 50)');
		process.exit(0);
	}

	const { path, mode, options } = parseWorkspaceArgs(args);
	runCommand(getLint(path, spec, mode, options), mode);
}
