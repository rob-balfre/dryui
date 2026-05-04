// dryui info <component> — Show component or composed output reference

import type { Spec } from './types.js';
import {
	findComponent as findComponentByQuery,
	formatCompound,
	formatSimple
} from '@dryui/mcp/spec-formatters';
import { toonComponent, toonError } from '@dryui/mcp/toon';
import { renderCommandResultByMode, runStandardCommand, type OutputMode } from '../run.js';

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
	return renderCommandResultByMode(mode, def, {
		toon: (value) => toonComponent(name, value, { full: options.full }),
		text: (value) => (value.compound ? formatCompound(name, value) : formatSimple(name, value))
	});
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
	runStandardCommand(args, {
		help: {
			usage: 'dryui info <component>[,<component>,...] [--text] [--full]',
			description: [
				'Show API reference for one or more DryUI components.',
				'Comma-separated names are supported for batch lookup.'
			],
			options: [
				'  --text    Plain-text output for humans (default is TOON)',
				'  --full    Include full example code (disables truncation)'
			],
			examples: [
				'  dryui info Button',
				'  dryui info button             # case-insensitive',
				'  dryui info Button,Tabs,Select # batch lookup',
				'  dryui info Button --text'
			]
		},
		allowJson: false,
		minPositionals: 1,
		execute: ({ args, mode, positionals }) =>
			getInfoBatch(positionals[0]!, spec, mode, {
				full: args.includes('--full')
			})
	});
}
