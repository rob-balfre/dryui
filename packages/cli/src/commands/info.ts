// dryui info <component> — Show component or composed output reference

import type { Spec } from './types.js';
import {
	findComponent as findComponentByQuery,
	formatCompound,
	formatSimple
} from '@dryui/mcp/spec-formatters';
import { runCommand } from '../run.js';

// Re-export shared formatters so existing consumers (tests, etc.) can import from here.
export { formatCompound, formatSimple };

/**
 * Look up a component by name (case-insensitive).
 * Returns the canonical name and definition, or null if not found.
 */
export function findComponent(spec: Spec, query: string) {
	return findComponentByQuery(query, spec.components);
}

/**
 * Get the info output for a component query.
 * Returns { output, error, exitCode }.
 */
export function getInfo(
	query: string,
	spec: Spec
): { output: string; error: string | null; exitCode: number } {
	const result = findComponent(spec, query);

	if (!result) {
		const available = Object.keys(spec.components).sort();
		const error = [
			`Unknown component: "${query}"`,
			'',
			'Available components:',
			`  ${available.join(', ')}`
		].join('\n');
		return { output: '', error, exitCode: 1 };
	}

	const { name, def } = result;
	const output = def.compound ? formatCompound(name, def) : formatSimple(name, def);

	return { output, error: null, exitCode: 0 };
}

export function runInfo(args: string[], spec: Spec): void {
	if (args.length === 0 || args[0] === '--help') {
		console.log('Usage: dryui info <component>');
		console.log('');
		console.log('Show API reference for a DryUI component or composed output.');
		console.log('');
		console.log('Examples:');
		console.log('  dryui info Button');
		console.log('  dryui info card      # case-insensitive');
		console.log('  dryui info "hero sections"');
		process.exit(args[0] === '--help' ? 0 : 1);
	}

	const query = args[0];
	if (!query) {
		console.error('Error: missing component name');
		process.exit(1);
	}
	runCommand(getInfo(query, spec));
}
