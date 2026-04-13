// dryui install [path] — Print a project install plan

import { planInstall } from '@dryui/mcp/project-planner';
import type { Spec } from './types.js';
import { formatInstallPlan } from './project-planner.js';
import { toonInstallPlan } from '@dryui/mcp/toon';
import { resolveOutputMode, runCommand, type OutputMode } from '../run.js';

export function getInstall(
	inputPath: string | undefined,
	spec: Spec,
	mode: OutputMode
): { output: string; error: string | null; exitCode: number } {
	const plan = planInstall(spec, inputPath);
	switch (mode) {
		case 'toon':
			return { output: toonInstallPlan(plan), error: null, exitCode: 0 };
		case 'json':
			return { output: JSON.stringify(plan, null, 2), error: null, exitCode: 0 };
		default:
			return { output: formatInstallPlan(plan), error: null, exitCode: 0 };
	}
}

export function runInstall(args: string[], spec: Spec): void {
	if (args[0] === '--help') {
		console.log('Usage: dryui install [--json] [--text] [path]');
		console.log('');
		console.log('Print the DryUI project install plan.');
		console.log('');
		console.log('Options:');
		console.log('  --text    Plain-text output for humans (default is TOON)');
		console.log('  --json    Output raw JSON instead');
		process.exit(0);
	}

	const { mode } = resolveOutputMode(args);
	const path = args.find((a) => !a.startsWith('--'));
	runCommand(getInstall(path, spec, mode), mode);
}
