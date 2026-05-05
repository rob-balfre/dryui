import pkg from '../../package.json';
import { homeRelative } from '../run.js';

const VERSION = pkg.version;

/**
 * Print compact DryUI setup hints for agent SessionStart hooks.
 */
export function emitAmbient(): void {
	console.log(`dryui/ambient v${VERSION} | cwd: ${homeRelative(process.cwd())}`);
	console.log('next[2]:');
	console.log('  dryui setup -- open editor and agent setup');
	console.log('  dryui feedback ui -- open the feedback dashboard');
}
