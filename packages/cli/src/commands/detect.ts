// dryui detect [path] — Detect DryUI project setup

import { detectProject } from '@dryui/mcp/project-planner';
import type { Spec } from './types.js';
import { formatProjectDetection } from './project-planner.js';
import { toonProjectDetection } from '@dryui/mcp/toon';
import { renderCommandResultByMode, runStandardCommand, type OutputMode } from '../run.js';

export function getDetect(
	inputPath: string | undefined,
	spec: Spec,
	mode: OutputMode
): { output: string; error: string | null; exitCode: number } {
	const detection = detectProject(spec, inputPath);
	return renderCommandResultByMode(mode, detection, {
		toon: (value) => toonProjectDetection(value),
		json: (value) => JSON.stringify(value, null, 2),
		text: (value) => formatProjectDetection(value)
	});
}

export function runDetect(args: string[], spec: Spec): void {
	runStandardCommand(args, {
		help: {
			usage: 'dryui detect [--json] [--text] [path]',
			description: ['Detect the current DryUI project setup.'],
			options: [
				'  --text    Plain-text output for humans (default is TOON)',
				'  --json    Output raw JSON instead'
			]
		},
		execute: ({ mode, positionals }) => getDetect(positionals[0], spec, mode)
	});
}
