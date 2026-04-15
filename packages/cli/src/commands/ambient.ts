import pkg from '../../package.json';
import spec from '../../../mcp/src/spec.json';
import { detectProject } from '../../../mcp/src/project-planner.js';
import { toonProjectDetection } from '@dryui/mcp/toon';
import { homeRelative } from '../run.js';

const VERSION = pkg.version;

/**
 * Print a compact DryUI dashboard for agent SessionStart hooks. Silent when
 * the project shows no DryUI signal so non-DryUI sessions stay clean.
 */
export function emitAmbient(): void {
	try {
		const detection = detectProject(spec, undefined);
		const hasDryuiSignal =
			detection.dependencies.ui ||
			detection.dependencies.primitives ||
			detection.dependencies.lint ||
			detection.theme.defaultImported;
		if (!hasDryuiSignal) return;
		console.log(`dryui/ambient v${VERSION} | cwd: ${homeRelative(process.cwd())}`);
		const summary = toonProjectDetection(detection)
			.replace(/\n(?:\n)?next\[\d+\]:[\s\S]*$/, '')
			.trimEnd();
		console.log(summary);
		console.log('next[2]:');
		console.log('  ask --scope setup "" -- inspect setup status and install guidance');
		console.log('  ask --scope component "Button" -- inspect a component before editing');
	} catch {
		// Detection failed — silent exit keeps agent sessions noise-free.
	}
}
