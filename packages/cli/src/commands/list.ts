// dryui list [--category <cat>] — List components

import type { Spec } from './types.js';
import { pad } from '../format.js';
import { runCommand } from '../run.js';

interface ListOptions {
	category?: string | null;
}

/**
 * Collect all unique categories from the spec.
 */
export function getCategories(spec: Spec): string[] {
	const cats = new Set<string>();
	for (const def of Object.values(spec.components)) {
		cats.add(def.category);
	}
	return [...cats].sort();
}

/**
 * Group components by category.
 */
export function groupByCategory(spec: Spec): Map<string, { name: string; description: string }[]> {
	const groups = new Map<string, { name: string; description: string }[]>();

	for (const [name, def] of Object.entries(spec.components)) {
		const cat = def.category;
		if (!groups.has(cat)) {
			groups.set(cat, []);
		}
		const group = groups.get(cat);
		if (group) group.push({ name, description: def.description });
	}

	// Sort entries within each category
	for (const entries of groups.values()) {
		entries.sort((a, b) => a.name.localeCompare(b.name));
	}

	return groups;
}

/**
 * Get the list output, optionally filtered by category.
 * Returns { output, error, exitCode }.
 */
export function getList(
	category: string | null,
	spec: Spec,
	options: ListOptions = {}
): { output: string; error: string | null; exitCode: number } {
	const sections: string[] = [];
	const validCategories = getCategories(spec);

	if (category && !validCategories.includes(category)) {
		const error = [
			`Unknown category: "${category}"`,
			'',
			'Valid categories:',
			`  ${validCategories.join(', ')}`
		].join('\n');
		return { output: '', error, exitCode: 1 };
	}

	const groups = groupByCategory(spec);
	const categoriesToShow = category ? [category] : [...groups.keys()].sort();

	for (const cat of categoriesToShow) {
		const entries = groups.get(cat);
		if (!entries || entries.length === 0) continue;

		const lines: string[] = [];
		lines.push(`${cat.charAt(0).toUpperCase() + cat.slice(1)}:`);

		const maxNameLen = Math.max(...entries.map((e) => e.name.length));

		for (const entry of entries) {
			lines.push(`  ${pad(entry.name, maxNameLen + 2)}${entry.description}`);
		}

		sections.push(lines.join('\n'));
	}

	return { output: sections.join('\n\n'), error: null, exitCode: 0 };
}

export function runList(args: string[], spec: Spec): void {
	if (args[0] === '--help') {
		console.log('Usage: dryui list [--category <category>]');
		console.log('');
		console.log('List DryUI components.');
		console.log('');
		console.log('Options:');
		console.log('  --category <cat>  Filter by category');
		console.log('');
		console.log('Categories:');
		const cats = getCategories(spec);
		console.log(`  ${cats.join(', ')}`);
		process.exit(0);
	}

	let filterCategory: string | null = null;

	// Parse --category flag
	const catIdx = args.indexOf('--category');
	if (catIdx !== -1) {
		const catValue = args[catIdx + 1];
		if (!catValue) {
			console.error('Error: --category requires a value');
			process.exit(1);
		}
		filterCategory = catValue.toLowerCase();
	}

	runCommand(getList(filterCategory, spec));
}
