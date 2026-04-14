// dryui compose <query> — Look up composition guidance

import type { Spec } from './types.js';
import { searchComposition, formatCompositionResult } from '@dryui/mcp/composition-search';
import { toonComposition } from '@dryui/mcp/toon';
import {
	commandError,
	renderCommandResultByMode,
	runStandardCommand,
	type CommandResult,
	type OutputMode
} from '../run.js';

const SETUP_PREAMBLE = [
	"\u26A0 SETUP: Root +layout.svelte must import '@dryui/ui/themes/default.css'",
	'  and dark.css. app.html needs <html class="theme-auto">.',
	'  Not set up? Run: dryui compose "app shell"',
	''
].join('\n');

const EMPTY_MATCH_HINTS = [
	'Try a component name (e.g. "DatePicker", "Avatar")',
	'Try a UI concept (e.g. "date input", "image placeholder")',
	'Try a pattern name (e.g. "search-form", "dashboard-page")'
];

export function getCompose(
	query: string,
	spec: Spec,
	mode: OutputMode,
	options: { full?: boolean } = {}
): CommandResult {
	if (!spec.composition) {
		return commandError(
			mode,
			'missing-data',
			'No composition data available. Rebuild the MCP package.'
		);
	}

	const results = searchComposition(spec.composition, query);
	const isEmpty = !results.componentMatches.length && !results.recipeMatches.length;

	return renderCommandResultByMode(
		mode,
		results,
		{
			toon: (value) => toonComposition(value, spec.components, { full: options.full }),
			text: (value) => {
				if (isEmpty) {
					const lines = [
						`No composition guidance found for "${query}".`,
						'',
						'Try:',
						...EMPTY_MATCH_HINTS.map((hint) => `- ${hint}`)
					];
					return lines.join('\n');
				}
				const output = SETUP_PREAMBLE + '\n' + formatCompositionResult(value, spec.components);
				return output.trimEnd();
			}
		},
		0
	);
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
