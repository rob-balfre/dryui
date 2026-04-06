// dryui compose <query> — Look up composition guidance

import type { Spec, CompositionComponentDef, CompositionRecipeDef } from './types.js';
import { runCommand } from '../run.js';

const STOP_WORDS = new Set([
	'a',
	'an',
	'the',
	'and',
	'or',
	'but',
	'in',
	'on',
	'at',
	'to',
	'for',
	'of',
	'with',
	'by',
	'from',
	'is',
	'it',
	'that',
	'this',
	'as',
	'be',
	'are',
	'was',
	'were',
	'been',
	'has',
	'have',
	'had',
	'do',
	'does',
	'did',
	'will',
	'would',
	'could',
	'should',
	'may',
	'might',
	'can',
	'i',
	'me',
	'my',
	'we',
	'our',
	'you',
	'your',
	'need',
	'want',
	'like',
	'create',
	'make',
	'build',
	'add',
	'using',
	'use',
	'show',
	'display'
]);

function tokenize(text: string): string[] {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, ' ')
		.split(/\s+/)
		.filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function scoreText(tokens: string[], text: string): number {
	const lower = text.toLowerCase();
	return tokens.reduce((score, t) => score + (lower.includes(t) ? 1 : 0), 0);
}

export function getCompose(
	query: string,
	spec: Spec
): { output: string; error: string | null; exitCode: number } {
	if (!spec.composition) {
		return {
			output: '',
			error: 'No composition data available. Rebuild the MCP package.',
			exitCode: 1
		};
	}

	const q = query.toLowerCase();
	const tokens = tokenize(query);

	// Try exact substring first (original behavior for precise queries)
	const exactComponentMatches: CompositionComponentDef[] = [];
	const exactRecipeMatches: CompositionRecipeDef[] = [];

	for (const comp of Object.values(spec.composition.components)) {
		if (
			comp.component.toLowerCase().includes(q) ||
			comp.useWhen.toLowerCase().includes(q) ||
			comp.alternatives.some(
				(a) => a.component.toLowerCase().includes(q) || a.useWhen.toLowerCase().includes(q)
			) ||
			comp.antiPatterns.some((ap) => ap.pattern.toLowerCase().includes(q))
		) {
			exactComponentMatches.push(comp);
		}
	}

	for (const recipe of Object.values(spec.composition.recipes)) {
		if (
			recipe.name.toLowerCase().includes(q) ||
			recipe.description.toLowerCase().includes(q) ||
			recipe.tags.some((t) => t.toLowerCase().includes(q)) ||
			recipe.components.some((c) => c.toLowerCase().includes(q))
		) {
			exactRecipeMatches.push(recipe);
		}
	}

	// If exact matching found results, use those
	let componentMatches: CompositionComponentDef[];
	let recipeMatches: CompositionRecipeDef[];

	if (exactComponentMatches.length || exactRecipeMatches.length) {
		componentMatches = exactComponentMatches;
		recipeMatches = exactRecipeMatches;
	} else if (tokens.length) {
		// Fall back to token-based scoring
		const scoredComponents: Array<{ comp: CompositionComponentDef; score: number }> = [];
		for (const comp of Object.values(spec.composition.components)) {
			const corpus = [
				comp.component,
				comp.useWhen,
				...comp.alternatives.flatMap((a) => [a.component, a.useWhen]),
				...comp.antiPatterns.map((ap) => ap.pattern),
				...comp.combinesWith
			].join(' ');
			const score = scoreText(tokens, corpus);
			if (score > 0) scoredComponents.push({ comp, score });
		}

		const scoredRecipes: Array<{ recipe: CompositionRecipeDef; score: number }> = [];
		for (const recipe of Object.values(spec.composition.recipes)) {
			const corpus = [recipe.name, recipe.description, ...recipe.tags, ...recipe.components].join(
				' '
			);
			const score = scoreText(tokens, corpus);
			if (score > 0) scoredRecipes.push({ recipe, score });
		}

		scoredComponents.sort((a, b) => b.score - a.score);
		scoredRecipes.sort((a, b) => b.score - a.score);

		const minScore = Math.max(1, Math.floor(tokens.length * 0.3));
		componentMatches = scoredComponents
			.filter((s) => s.score >= minScore)
			.slice(0, 10)
			.map((s) => s.comp);
		recipeMatches = scoredRecipes
			.filter((s) => s.score >= minScore)
			.slice(0, 5)
			.map((s) => s.recipe);
	} else {
		componentMatches = [];
		recipeMatches = [];
	}

	if (!componentMatches.length && !recipeMatches.length) {
		return {
			output: '',
			error: `No composition guidance found for "${query}".\n\nTry:\n- A component name (e.g. "DatePicker", "Avatar")\n- A UI concept (e.g. "date input", "image placeholder")\n- A pattern name (e.g. "search-form", "dashboard-page")`,
			exitCode: 1
		};
	}

	const lines: string[] = [];

	lines.push("\u26A0 SETUP: Root +layout.svelte must import '@dryui/ui/themes/default.css'");
	lines.push('  and dark.css. app.html needs <html class="theme-auto">.');
	lines.push('  Not set up? Run: dryui compose "app shell"');
	lines.push('');

	for (const comp of componentMatches) {
		lines.push(`── ${comp.component} ──────────────────────────────`);
		lines.push(`[DEV GUIDANCE — do not render as page content]`);
		lines.push(`Use: ${comp.component} — ${comp.useWhen}`);
		lines.push('');

		for (const alt of comp.alternatives) {
			lines.push(`  ${alt.rank}. ${alt.component} (${alt.useWhen})`);
			lines.push(
				alt.snippet
					.split('\n')
					.map((l: string) => `     ${l}`)
					.join('\n')
			);
			lines.push('');
		}

		for (const ap of comp.antiPatterns) {
			lines.push(`\u26A0 Anti-pattern: ${ap.pattern}`);
			lines.push(`  Why: ${ap.reason}`);
			lines.push(`  Use ${ap.fix} instead`);
			lines.push('');
		}

		if (comp.combinesWith.length) {
			lines.push(`Combines with: ${comp.combinesWith.join(', ')}`);
		}
		lines.push('');
	}

	for (const recipe of recipeMatches) {
		lines.push(`── Recipe: ${recipe.name} ──────────────────────────────`);
		lines.push(`[DEV GUIDANCE — do not render as page content]`);
		lines.push(recipe.description);
		lines.push(`Components: ${recipe.components.join(', ')}`);
		lines.push('');
		lines.push(`[CODE — use this in your Svelte file]`);
		lines.push(recipe.snippet);
		lines.push('');
	}

	return { output: lines.join('\n').trimEnd(), error: null, exitCode: 0 };
}

export function runCompose(args: string[], spec: Spec): void {
	if (args.length === 0 || args[0] === '--help') {
		console.log('Usage: dryui compose <query>');
		console.log('');
		console.log('Look up composition guidance for building UIs with DryUI.');
		console.log('Returns ranked component alternatives, anti-patterns, and recipes.');
		console.log('');
		console.log('Examples:');
		console.log('  dryui compose "search form"');
		console.log('  dryui compose "hotel card"');
		console.log('  dryui compose "travel booking"');
		process.exit(args[0] === '--help' ? 0 : 1);
	}

	const query = args.join(' ').trim();
	runCommand(getCompose(query, spec));
}
