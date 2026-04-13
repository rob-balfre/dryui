// dryui install [path] — Print a project install plan

import { planInstall } from '@dryui/mcp/project-planner';
import type { Spec } from './types.js';
import { formatInstallPlan } from './project-planner.js';
import { toonInstallPlan } from '@dryui/mcp/toon';
import { renderCommandResultByMode, runStandardCommand, type OutputMode } from '../run.js';

export function getInstall(
	inputPath: string | undefined,
	spec: Spec,
	mode: OutputMode
): { output: string; error: string | null; exitCode: number } {
	const plan = planInstall(spec, inputPath);
	return renderCommandResultByMode(mode, plan, {
		toon: (value) => toonInstallPlan(value),
		json: (value) => JSON.stringify(value, null, 2),
		text: (value) => formatInstallPlan(value)
	});
}

export function runInstall(args: string[], spec: Spec): void {
	runStandardCommand(args, {
		help: {
			usage: 'dryui install [--json] [--text] [path]',
			description: ['Print the DryUI project install plan.'],
			options: [
				'  --text    Plain-text output for humans (default is TOON)',
				'  --json    Output raw JSON instead'
			]
		},
		execute: ({ mode, positionals }) => getInstall(positionals[0], spec, mode)
	});
}
