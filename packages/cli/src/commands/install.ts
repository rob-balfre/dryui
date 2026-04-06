// dryui install [path] — Print a project install plan

import { planInstall } from '../../../mcp/src/project-planner.js';
import type { Spec } from './types.js';
import { formatInstallPlan } from './project-planner.js';
import { runCommand } from '../run.js';

function parseInstallArgs(args: string[]): { json: boolean; path: string | undefined } {
	let json = false;
	let path: string | undefined;

	for (const arg of args) {
		if (arg === '--json') {
			json = true;
			continue;
		}
		if (arg.startsWith('--')) {
			continue;
		}
		if (!path) {
			path = arg;
		}
	}

	return { json, path };
}

export function getInstall(
	inputPath: string | undefined,
	spec: Spec,
	options: { json?: boolean } = {}
): { output: string; error: string | null; exitCode: number } {
	const plan = planInstall(spec, inputPath);
	return options.json
		? { output: JSON.stringify(plan, null, 2), error: null, exitCode: 0 }
		: { output: formatInstallPlan(plan), error: null, exitCode: 0 };
}

export function runInstall(args: string[], spec: Spec): void {
	if (args[0] === '--help') {
		console.log('Usage: dryui install [--json] [path]');
		console.log('');
		console.log('Print the DryUI project install plan.');
		console.log('');
		console.log('Options:');
		console.log('  --json    Output raw JSON instead of formatted text');
		process.exit(0);
	}

	const { json, path } = parseInstallArgs(args);
	runCommand(getInstall(path, spec, { json }));
}
