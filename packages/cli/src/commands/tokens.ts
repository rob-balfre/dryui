// dryui tokens [--category <cat>] — List design tokens

import { extractTokens, getTokenCategories } from '@dryui/mcp/tokens';
import { toonTokens } from '@dryui/mcp/toon';
import { pad } from '@dryui/mcp/spec-formatters';
import {
	commandError,
	renderCommandResultByMode,
	resolveOutputMode,
	runCommand,
	type CommandResult,
	type OutputMode
} from '../run.js';

/**
 * Get the tokens output, optionally filtered by category.
 * Returns { output, error, exitCode }.
 */
export function getTokens(category: string | null, mode: OutputMode): CommandResult {
	const result = extractTokens(category ?? undefined);

	if (result.tokens.length === 0 && category) {
		const available = getTokenCategories();
		return commandError(
			mode,
			'invalid-category',
			`Unknown category "${category}". Available: ${available.join(', ')}`,
			available
		);
	}

	const grouped = new Map<string, typeof result.tokens>();
	for (const token of result.tokens) {
		if (!grouped.has(token.category)) {
			grouped.set(token.category, []);
		}
		grouped.get(token.category)!.push(token);
	}

	const sortedCategories = [...grouped.keys()].sort();
	return renderCommandResultByMode(mode, result, {
		toon: (value) => toonTokens(value, category ?? undefined),
		text: () => {
			// Plain text output grouped by category
			const sections: string[] = [];

			for (const cat of sortedCategories) {
				const tokens = grouped.get(cat);
				if (!tokens || tokens.length === 0) continue;

				const lines: string[] = [];
				lines.push(`${cat.charAt(0).toUpperCase() + cat.slice(1)} (${tokens.length}):`);

				const maxNameLen = Math.max(...tokens.map((t) => t.name.length));

				for (const token of tokens) {
					const darkDiff = token.dark !== token.light ? `  dark: ${token.dark}` : '';
					lines.push(`  ${pad(token.name, maxNameLen + 2)}${token.light}${darkDiff}`);
				}

				sections.push(lines.join('\n'));
			}

			const summary = `${result.total} tokens across ${sortedCategories.length} categories`;
			return summary + '\n\n' + sections.join('\n\n');
		}
	});
}

export function runTokens(args: string[]): void {
	if (args[0] === '--help') {
		console.log('Usage: dryui tokens [--category <category>] [--text]');
		console.log('');
		console.log('List DryUI --dry-* CSS design tokens.');
		console.log('');
		console.log('Options:');
		console.log('  --category <cat>  Filter by category');
		console.log('  --text            Plain-text output for humans (default is TOON)');
		console.log('');
		console.log('Categories:');
		const cats = getTokenCategories();
		console.log(`  ${cats.join(', ')}`);
		process.exit(0);
	}

	const { mode } = resolveOutputMode(args, false);
	let filterCategory: string | null = null;

	// Parse --category flag
	const catIdx = args.indexOf('--category');
	if (catIdx !== -1) {
		const catValue = args[catIdx + 1];
		if (!catValue || catValue.startsWith('--')) {
			runCommand(
				commandError(mode, 'missing-value', '--category requires a value', getTokenCategories()),
				mode
			);
			return;
		}
		filterCategory = catValue.toLowerCase();
	}

	runCommand(getTokens(filterCategory, mode), mode);
}
