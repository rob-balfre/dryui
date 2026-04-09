// dryui info <component> — Show component or composed output reference

import type { Spec } from './types.js';
import {
	findComponent as findComponentByQuery,
	formatCompound,
	formatSimple
} from '@dryui/mcp/spec-formatters';
import { toonComponent, toonError } from '@dryui/mcp/toon';
import { runCommand, type OutputMode } from '../run.js';

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
 * Get the info output for a single component query.
 * Returns { output, error, exitCode }.
 */
export function getInfo(
	query: string,
	spec: Spec,
	options?: { toon?: boolean; full?: boolean }
): { output: string; error: string | null; exitCode: number } {
	const result = findComponent(spec, query);

	if (!result) {
		const available = Object.keys(spec.components).sort();
		if (options?.toon) {
			return {
				output: '',
				error: toonError('not-found', `Unknown component: "${query}"`, available),
				exitCode: 1
			};
		}
		const error = [
			`Unknown component: "${query}"`,
			'',
			'Available components:',
			`  ${available.join(', ')}`
		].join('\n');
		return { output: '', error, exitCode: 1 };
	}

	const { name, def } = result;

	if (options?.toon) {
		return { output: toonComponent(name, def, { full: options?.full }), error: null, exitCode: 0 };
	}

	const output = def.compound ? formatCompound(name, def) : formatSimple(name, def);
	return { output, error: null, exitCode: 0 };
}

/**
 * Get info output for multiple comma-separated component names.
 * Returns results for found components and errors for unknown ones.
 */
export function getInfoBatch(
	query: string,
	spec: Spec,
	options?: { toon?: boolean; full?: boolean }
): { output: string; error: string | null; exitCode: number } {
	const names = query.split(',').map((n) => n.trim()).filter(Boolean);

	// Single name: delegate to getInfo for backward compatibility
	if (names.length <= 1) {
		return getInfo(names[0] ?? query, spec, options);
	}

	const parts: string[] = [];
	let hasError = false;

	for (const name of names) {
		const result = getInfo(name, spec, options);
		if (result.error) {
			hasError = true;
			parts.push(result.error);
		} else {
			parts.push(result.output);
		}
	}

	const separator = options?.toon ? '\n---\n' : '\n\n---\n\n';
	return {
		output: parts.join(separator),
		error: null,
		exitCode: hasError ? 1 : 0
	};
}

export function runInfo(args: string[], spec: Spec): void {
	if (args.length === 0 || args[0] === '--help') {
		console.log('Usage: dryui info <component>[,<component>,...] [--toon] [--full]');
		console.log('');
		console.log('Show API reference for one or more DryUI components.');
		console.log('Comma-separated names are supported for batch lookup.');
		console.log('');
		console.log('Options:');
		console.log('  --toon    Output in TOON format (token-optimized for agents)');
		console.log('  --full    Include full example code (disables truncation)');
		console.log('');
		console.log('Examples:');
		console.log('  dryui info Button');
		console.log('  dryui info card              # case-insensitive');
		console.log('  dryui info Button,Card,Select # batch lookup');
		console.log('  dryui info Button --toon');
		process.exit(args[0] === '--help' ? 0 : 1);
	}

	const toon = args.includes('--toon');
	const full = args.includes('--full');
	const query = args.find((a) => !a.startsWith('--'));
	if (!query) {
		console.error('Error: missing component name');
		process.exit(1);
	}
	const mode: OutputMode = toon ? 'toon' : 'text';
	runCommand(getInfoBatch(query, spec, { toon, full }), mode);
}
