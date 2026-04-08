// dryui lint [path] — Print deterministic workspace findings

import { buildWorkspaceReport } from '../../../mcp/src/workspace-audit.js';
import type { Spec } from './types.js';
import { formatWorkspaceReport } from '../format.js';
import { toonWorkspaceReport } from '@dryui/mcp/toon';
import { parseWorkspaceArgs } from './workspace-args.js';
import { runCommand, type OutputMode } from '../run.js';

export function getLint(
	inputPath: string | undefined,
	spec: Spec,
	options: {
		json?: boolean;
		toon?: boolean;
		full?: boolean;
		include?: readonly string[];
		exclude?: readonly string[];
		maxSeverity?: 'error' | 'warning' | 'info';
		changed?: boolean;
	} = {}
): { output: string; error: string | null; exitCode: number } {
	try {
		const report = buildWorkspaceReport(spec, {
			...(inputPath ? { cwd: inputPath } : {}),
			...(options.include ? { include: options.include } : {}),
			...(options.exclude ? { exclude: options.exclude } : {}),
			...(options.changed === undefined ? {} : { changed: options.changed }),
			...(options.maxSeverity ? { maxSeverity: options.maxSeverity } : {})
		});

		if (options.toon) {
			return {
				output: toonWorkspaceReport(report, { title: 'lint', command: 'lint', full: options.full }),
				error: null,
				exitCode: report.findings.length > 0 ? 1 : 0
			};
		}

		if (options.json) {
			return {
				output: JSON.stringify(report, null, 2),
				error: null,
				exitCode: report.findings.length > 0 ? 1 : 0
			};
		}

		return {
			output: formatWorkspaceReport(report, { title: 'DryUI lint', summaryLabel: 'Issues' }),
			error: null,
			exitCode: report.findings.length > 0 ? 1 : 0
		};
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
			'Usage: dryui lint [path] [--json] [--toon] [--full] [--include <glob>] [--exclude <glob>] [--max-severity <level>] [--changed]'
		);
		console.log('');
		console.log('Print deterministic workspace findings.');
		console.log('');
		console.log('Options:');
		console.log('  --toon    Output in TOON format (token-optimized for agents)');
		console.log('  --full    Show all findings (disables truncation at 50)');
		process.exit(0);
	}

	const { path, options } = parseWorkspaceArgs(args);
	const mode: OutputMode = options.toon ? 'toon' : options.json ? 'json' : 'text';
	runCommand(getLint(path, spec, options), mode);
}
