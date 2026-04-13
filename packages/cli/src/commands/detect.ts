// dryui detect [path] — Detect DryUI project setup

import { detectProject } from '@dryui/mcp/project-planner';
import type { Spec } from './types.js';
import { formatProjectDetection } from './project-planner.js';
import { toonProjectDetection } from '@dryui/mcp/toon';
import { resolveOutputMode, runCommand, type OutputMode } from '../run.js';

export function getDetect(
	inputPath: string | undefined,
	spec: Spec,
	mode: OutputMode
): { output: string; error: string | null; exitCode: number } {
	const detection = detectProject(spec, inputPath);

	switch (mode) {
		case 'toon':
			return { output: toonProjectDetection(detection), error: null, exitCode: 0 };
		case 'json':
			return { output: JSON.stringify(detection, null, 2), error: null, exitCode: 0 };
		default:
			return { output: formatProjectDetection(detection), error: null, exitCode: 0 };
	}
}

export function runDetect(args: string[], spec: Spec): void {
	if (args[0] === '--help') {
		console.log('Usage: dryui detect [--json] [--text] [path]');
		console.log('');
		console.log('Detect the current DryUI project setup.');
		console.log('');
		console.log('Options:');
		console.log('  --text    Plain-text output for humans (default is TOON)');
		console.log('  --json    Output raw JSON instead');
		process.exit(0);
	}

	const { mode } = resolveOutputMode(args);
	const path = args.find((a) => !a.startsWith('--'));
	runCommand(getDetect(path, spec, mode), mode);
}
