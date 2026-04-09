// dryui detect [path] — Detect DryUI project setup

import { detectProject } from '../../../mcp/src/project-planner.js';
import type { Spec } from './types.js';
import { formatProjectDetection } from './project-planner.js';
import { toonProjectDetection } from '@dryui/mcp/toon';
import { runCommand, type OutputMode } from '../run.js';

function parseDetectArgs(args: string[]): {
	json: boolean;
	toon: boolean;
	path: string | undefined;
} {
	let json = false;
	let toon = false;
	let path: string | undefined;

	for (let index = 0; index < args.length; index++) {
		const arg = args[index];
		if (!arg) continue;
		if (arg === '--json') {
			json = true;
			continue;
		}
		if (arg === '--toon') {
			toon = true;
			continue;
		}
		if (arg.startsWith('--')) {
			continue;
		}
		if (!path) {
			path = arg;
		}
	}

	return { json, toon, path };
}

export function getDetect(
	inputPath: string | undefined,
	spec: Spec,
	options: { json?: boolean; toon?: boolean } = {}
): { output: string; error: string | null; exitCode: number } {
	const detection = detectProject(spec, inputPath);

	if (options.toon) {
		return { output: toonProjectDetection(detection), error: null, exitCode: 0 };
	}

	return options.json
		? { output: JSON.stringify(detection, null, 2), error: null, exitCode: 0 }
		: { output: formatProjectDetection(detection), error: null, exitCode: 0 };
}

export function runDetect(args: string[], spec: Spec): void {
	if (args[0] === '--help') {
		console.log('Usage: dryui detect [--json] [--toon] [path]');
		console.log('');
		console.log('Detect the current DryUI project setup.');
		console.log('');
		console.log('Options:');
		console.log('  --json    Output raw JSON instead of formatted text');
		console.log('  --toon    Output in TOON format (token-optimized for agents)');
		process.exit(0);
	}

	const { json, toon, path } = parseDetectArgs(args);
	const mode: OutputMode = toon ? 'toon' : json ? 'json' : 'text';
	runCommand(getDetect(path, spec, { json, toon }), mode);
}
