// dryui info <component> — Show component or composed output reference

import type { Spec } from './types.js';
import {
	findComponent as findComponentByQuery,
	formatCompound,
	formatSimple
} from '@dryui/mcp/spec-formatters';
import { toonComponent, toonError } from '@dryui/mcp/toon';
import { resolveOutputMode, runCommand, type OutputMode } from '../run.js';

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
	mode: OutputMode,
	options: { full?: boolean } = {}
): { output: string; error: string | null; exitCode: number } {
	const result = findComponent(spec, query);

	if (!result) {
		const available = Object.keys(spec.components).sort();
		if (mode === 'toon') {
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

	switch (mode) {
		case 'toon':
			return {
				output: toonComponent(name, def, { full: options.full }),
				error: null,
				exitCode: 0
			};
		case 'text':
		default: {
			const output = def.compound ? formatCompound(name, def) : formatSimple(name, def);
			return { output, error: null, exitCode: 0 };
		}
	}
}

/**
 * Get info output for multiple comma-separated component names.
 * Returns results for found components and errors for unknown ones.
 */
export function getInfoBatch(
	query: string,
	spec: Spec,
	mode: OutputMode,
	options: { full?: boolean } = {}
): { output: string; error: string | null; exitCode: number } {
	const names = query
		.split(',')
		.map((n) => n.trim())
		.filter(Boolean);

	// Single name: delegate to getInfo for backward compatibility
	if (names.length <= 1) {
		return getInfo(names[0] ?? query, spec, mode, options);
	}

	const parts: string[] = [];
	let hasError = false;

	for (const name of names) {
		const result = getInfo(name, spec, mode, options);
		if (result.error) {
			hasError = true;
			parts.push(result.error);
		} else {
			parts.push(result.output);
		}
	}

	const separator = mode === 'toon' ? '\n---\n' : '\n\n---\n\n';
	return {
		output: parts.join(separator),
		error: null,
		exitCode: hasError ? 1 : 0
	};
}

export function runInfo(args: string[], spec: Spec): void {
	if (args.length === 0 || args[0] === '--help') {
		console.log('Usage: dryui info <component>[,<component>,...] [--text] [--full]');
		console.log('');
		console.log('Show API reference for one or more DryUI components.');
		console.log('Comma-separated names are supported for batch lookup.');
		console.log('');
		console.log('Options:');
		console.log('  --text    Plain-text output for humans (default is TOON)');
		console.log('  --full    Include full example code (disables truncation)');
		console.log('');
		console.log('Examples:');
		console.log('  dryui info Button');
		console.log('  dryui info card              # case-insensitive');
		console.log('  dryui info Button,Card,Select # batch lookup');
		console.log('  dryui info Button --text');
		process.exit(args[0] === '--help' ? 0 : 1);
	}

	const full = args.includes('--full');
	const { mode } = resolveOutputMode(args, false);
	const query = args.find((a) => !a.startsWith('--'));
	if (!query) {
		console.error('Error: missing component name');
		process.exit(1);
	}
	runCommand(getInfoBatch(query, spec, mode, { full }), mode);
}
