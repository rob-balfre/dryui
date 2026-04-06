// dryui doctor [path] — Inspect workspace health with human-readable findings

import { buildWorkspaceReport } from '../../../mcp/src/workspace-audit.js';
import type { Spec } from './types.js';
import { formatWorkspaceReport } from '../format.js';
import { parseWorkspaceArgs } from './workspace-args.js';
import { runCommand } from '../run.js';

export function getDoctor(
	inputPath: string | undefined,
	spec: Spec,
	options: {
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
			...(options.maxSeverity ? { maxSeverity: options.maxSeverity } : {}),
			...(options.changed === undefined ? {} : { changed: options.changed })
		});
		return {
			output: formatWorkspaceReport(report, {
				title: 'DryUI workspace doctor',
				showSkipped: true,
				summaryLabel: 'Findings'
			}),
			error: null,
			exitCode: 0
		};
	} catch (error) {
		return {
			output: '',
			error: error instanceof Error ? error.message : String(error),
			exitCode: 1
		};
	}
}

export function runDoctor(args: string[], spec: Spec): void {
	if (args[0] === '--help') {
		console.log(
			'Usage: dryui doctor [path] [--include <glob>] [--exclude <glob>] [--max-severity <level>] [--changed]'
		);
		console.log('');
		console.log('Inspect workspace health with human-readable findings.');
		process.exit(0);
	}

	const { path, options } = parseWorkspaceArgs(args);
	runCommand(getDoctor(path, spec, options));
}
