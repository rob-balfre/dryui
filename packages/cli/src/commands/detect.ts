// dryui detect [path] — Detect DryUI project setup

import { detectProject } from '../../../mcp/src/project-planner.js';
import type { Spec } from './types.js';
import { formatProjectDetection } from './project-planner.js';
import { runCommand } from '../run.js';

function parseDetectArgs(args: string[]): { json: boolean; path: string | undefined } {
	let json = false;
	let path: string | undefined;

	for (let index = 0; index < args.length; index++) {
		const arg = args[index];
		if (!arg) continue;
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

export function getDetect(
	inputPath: string | undefined,
	spec: Spec,
	options: { json?: boolean } = {}
): { output: string; error: string | null; exitCode: number } {
	const detection = detectProject(spec, inputPath);
	return options.json
		? { output: JSON.stringify(detection, null, 2), error: null, exitCode: 0 }
		: { output: formatProjectDetection(detection), error: null, exitCode: 0 };
}

export function runDetect(args: string[], spec: Spec): void {
	if (args[0] === '--help') {
		console.log('Usage: dryui detect [--json] [path]');
		console.log('');
		console.log('Detect the current DryUI project setup.');
		console.log('');
		console.log('Options:');
		console.log('  --json    Output raw JSON instead of formatted text');
		process.exit(0);
	}

	const { json, path } = parseDetectArgs(args);
	runCommand(getDetect(path, spec, { json }));
}
