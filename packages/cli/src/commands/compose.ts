// dryui compose <query> — Look up composition guidance

import type { Spec } from './types.js';
import { searchComposition, formatCompositionResult } from '@dryui/mcp/composition-search';
import { toonComposition, toonError } from '@dryui/mcp/toon';
import { renderCommandResultByMode, runStandardCommand, type OutputMode } from '../run.js';

const SETUP_PREAMBLE = [
	"\u26A0 SETUP: Root +layout.svelte must import '@dryui/ui/themes/default.css'",
	'  and dark.css. app.html needs <html class="theme-auto">.',
	'  Not set up? Run: dryui compose "app shell"',
	''
].join('\n');

export function getCompose(
	query: string,
	spec: Spec,
	mode: OutputMode,
	options: { full?: boolean } = {}
): { output: string; error: string | null; exitCode: number } {
	if (!spec.composition) {
		return {
			output: '',
			error: 'No composition data available. Rebuild the MCP package.',
			exitCode: 1
		};
	}

	const results = searchComposition(spec.composition, query);

	if (!results.componentMatches.length && !results.recipeMatches.length) {
		switch (mode) {
			case 'toon':
				return {
					output: '',
					error: toonError('no-results', `No composition guidance for "${query}"`, [
						'Try a component name (DatePicker, Avatar)',
						'Try a UI concept (date input, image placeholder)',
						'Try a pattern name (search-form, dashboard-page)'
					]),
					exitCode: 1
				};
			case 'text':
			default:
				return {
					output: '',
					error: `No composition guidance found for "${query}".\n\nTry:\n- A component name (e.g. "DatePicker", "Avatar")\n- A UI concept (e.g. "date input", "image placeholder")\n- A pattern name (e.g. "search-form", "dashboard-page")`,
					exitCode: 1
				};
		}
	}

	return renderCommandResultByMode(mode, results, {
		toon: (value) => toonComposition(value, spec.components, { full: options.full }),
		text: (value) => {
			const output = SETUP_PREAMBLE + '\n' + formatCompositionResult(value, spec.components);
			return output.trimEnd();
		}
	});
}

export function runCompose(args: string[], spec: Spec): void {
	runStandardCommand(args, {
		help: {
			usage: 'dryui compose <query> [--text] [--full]',
			description: [
				'Look up composition guidance for building UIs with DryUI.',
				'Returns ranked component alternatives, anti-patterns, and recipes.'
			],
			options: [
				'  --text    Plain-text output for humans (default is TOON)',
				'  --full    Include full code snippets (disables truncation)'
			],
			examples: [
				'  dryui compose "search form"',
				'  dryui compose "hotel card"',
				'  dryui compose "travel booking" --text'
			]
		},
		allowJson: false,
		minPositionals: 1,
		execute: ({ args, mode, positionals }) =>
			getCompose(positionals.join(' ').trim(), spec, mode, {
				full: args.includes('--full')
			})
	});
}
