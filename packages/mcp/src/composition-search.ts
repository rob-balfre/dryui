// Shared composition search and formatting.
// Used by both @dryui/mcp (tool + prompt handlers) and @dryui/cli (compose command).

import type {
	ComponentDef,
	CompositionComponentDef,
	CompositionRecipeDef,
	Spec
} from './spec-types.js';
import { componentKind, getBindableProps, getRequiredParts } from './spec-formatters.js';

export interface CompositionSearchResult {
	readonly componentMatches: readonly CompositionComponentDef[];
	readonly recipeMatches: readonly CompositionRecipeDef[];
}

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

/**
 * Search composition data for components and recipes matching a query.
 * Uses exact substring matching first, then falls back to token-based scoring.
 */
export function searchComposition(
	composition: NonNullable<Spec['composition']>,
	query: string
): CompositionSearchResult {
	const q = query.toLowerCase();
	const tokens = tokenize(query);

	// Try exact substring first
	const exactComponentMatches: CompositionComponentDef[] = [];
	const exactRecipeMatches: CompositionRecipeDef[] = [];

	for (const comp of Object.values(composition.components)) {
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

	for (const recipe of Object.values(composition.recipes)) {
		if (
			recipe.name.toLowerCase().includes(q) ||
			recipe.description.toLowerCase().includes(q) ||
			recipe.tags.some((t) => t.toLowerCase().includes(q)) ||
			recipe.components.some((c) => c.toLowerCase().includes(q))
		) {
			exactRecipeMatches.push(recipe);
		}
	}

	if (exactComponentMatches.length || exactRecipeMatches.length) {
		return { componentMatches: exactComponentMatches, recipeMatches: exactRecipeMatches };
	}

	// Fall back to token-based scoring
	if (!tokens.length) {
		return { componentMatches: [], recipeMatches: [] };
	}

	const scoredComponents: Array<{ comp: CompositionComponentDef; score: number }> = [];
	for (const comp of Object.values(composition.components)) {
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
	for (const recipe of Object.values(composition.recipes)) {
		const corpus = [recipe.name, recipe.description, ...recipe.tags, ...recipe.components].join(
			' '
		);
		const score = scoreText(tokens, corpus);
		if (score > 0) scoredRecipes.push({ recipe, score });
	}

	scoredComponents.sort((a, b) => b.score - a.score);
	scoredRecipes.sort((a, b) => b.score - a.score);

	const minScore = Math.max(1, Math.floor(tokens.length * 0.3));
	return {
		componentMatches: scoredComponents
			.filter((s) => s.score >= minScore)
			.slice(0, 10)
			.map((s) => s.comp),
		recipeMatches: scoredRecipes
			.filter((s) => s.score >= minScore)
			.slice(0, 5)
			.map((s) => s.recipe)
	};
}

/**
 * Format composition search results as human-readable text.
 * Used by MCP prompts and CLI text mode.
 */
export function formatCompositionResult(
	results: CompositionSearchResult,
	components: Record<string, ComponentDef>
): string {
	const lines: string[] = [];

	for (const comp of results.componentMatches) {
		lines.push(`── ${comp.component} ──────────────────────────────`);
		lines.push(`[DEV GUIDANCE — do not render as page content]`);
		lines.push(`Use: ${comp.component} — ${comp.useWhen}`);
		lines.push('');

		for (const alt of comp.alternatives) {
			lines.push(`  ${alt.rank}. ${alt.component} (${alt.useWhen})`);
			const spec = components[alt.component];
			if (spec) {
				const requiredParts = getRequiredParts(alt.component, spec);
				const bindables = getBindableProps(spec);
				lines.push(
					`     API: ${componentKind(spec)} | Required parts: ${requiredParts.length ? requiredParts.join(', ') : 'none'} | Bindables: ${bindables.length ? bindables.join(', ') : 'none'}`
				);
				lines.push('     Canonical usage:');
				lines.push(
					spec.example
						.split('\n')
						.map((line) => `       ${line}`)
						.join('\n')
				);
			}
			lines.push(
				alt.snippet
					.split('\n')
					.map((l) => `     ${l}`)
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

	for (const recipe of results.recipeMatches) {
		lines.push(`── Recipe: ${recipe.name} ──────────────────────────────`);
		lines.push(`[DEV GUIDANCE — do not render as page content]`);
		lines.push(recipe.description);
		lines.push(`Components: ${recipe.components.join(', ')}`);
		lines.push('');
		lines.push(`[CODE — use this in your Svelte file]`);
		lines.push(recipe.snippet);
		lines.push('');
	}

	return lines.join('\n');
}
