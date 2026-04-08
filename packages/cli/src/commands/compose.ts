// dryui compose <query> — Look up composition guidance

import type { Spec } from './types.js';
import { searchComposition, formatCompositionResult } from '@dryui/mcp/composition-search';
import { toonComposition, toonError } from '@dryui/mcp/toon';
import { runCommand, type OutputMode } from '../run.js';

const SETUP_PREAMBLE = [
	"\u26A0 SETUP: Root +layout.svelte must import '@dryui/ui/themes/default.css'",
	'  and dark.css. app.html needs <html class="theme-auto">.',
	'  Not set up? Run: dryui compose "app shell"',
	''
].join('\n');

export function getCompose(
	query: string,
	spec: Spec,
	options?: { toon?: boolean; full?: boolean }
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
		if (options?.toon) {
			return {
				output: '',
				error: toonError('no-results', `No composition guidance for "${query}"`, [
					'Try a component name (DatePicker, Avatar)',
					'Try a UI concept (date input, image placeholder)',
					'Try a pattern name (search-form, dashboard-page)'
				]),
				exitCode: 1
			};
		}
		return {
			output: '',
			error: `No composition guidance found for "${query}".\n\nTry:\n- A component name (e.g. "DatePicker", "Avatar")\n- A UI concept (e.g. "date input", "image placeholder")\n- A pattern name (e.g. "search-form", "dashboard-page")`,
			exitCode: 1
		};
	}

	if (options?.toon) {
		return {
			output: toonComposition(results, { full: options?.full }),
			error: null,
			exitCode: 0
		};
	}

	const output = SETUP_PREAMBLE + '\n' + formatCompositionResult(results);
	return { output: output.trimEnd(), error: null, exitCode: 0 };
}

export function runCompose(args: string[], spec: Spec): void {
	if (args.length === 0 || args[0] === '--help') {
		console.log('Usage: dryui compose <query> [--toon] [--full]');
		console.log('');
		console.log('Look up composition guidance for building UIs with DryUI.');
		console.log('Returns ranked component alternatives, anti-patterns, and recipes.');
		console.log('');
		console.log('Options:');
		console.log('  --toon    Output in TOON format (token-optimized for agents)');
		console.log('  --full    Include full code snippets (disables truncation)');
		console.log('');
		console.log('Examples:');
		console.log('  dryui compose "search form"');
		console.log('  dryui compose "hotel card"');
		console.log('  dryui compose "travel booking" --toon');
		process.exit(args[0] === '--help' ? 0 : 1);
	}

	const toon = args.includes('--toon');
	const full = args.includes('--full');
	const query = args.filter((a) => !a.startsWith('--')).join(' ').trim();
	const mode: OutputMode = toon ? 'toon' : 'text';
	runCommand(getCompose(query, spec, { toon, full }), mode);
}
