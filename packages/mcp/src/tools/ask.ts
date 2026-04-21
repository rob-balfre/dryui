import { extractTokens } from '../tokens.js';
import {
	planAdd,
	planInstall,
	type PlanAddOptions,
	type ProjectPlannerSpec
} from '../project-planner.js';
import { searchComposition } from '../composition-search.js';
import { findComponent } from '../spec-formatters.js';
import {
	FIELD_CAP,
	formatHelp,
	header,
	row,
	toonAddPlan,
	toonComponent,
	toonInstallPlan,
	truncateField
} from '../toon.js';
import type {
	ComponentDef,
	CompositionComponentDef,
	CompositionRecipeDef,
	Spec
} from '../spec-types.js';
import { StructuredToolError } from './tool-error.js';

const SNIPPET_CAP = 500;

export type AskScope = 'component' | 'recipe' | 'list' | 'setup';
export type AskListKind = 'component' | 'token';

interface AskInput {
	readonly query: string;
	readonly scope: AskScope;
	readonly kind?: AskListKind;
}

interface AskOptions {
	readonly cwd?: string;
}

type AskSpec = Spec & ProjectPlannerSpec;

function cap(value: string, max = FIELD_CAP): string {
	return truncateField(value, max)[0];
}

function codeBlock(label: string, body: string): string {
	return `${label}:\n${body
		.split('\n')
		.map((line) => `  ${line}`)
		.join('\n')}`;
}

function listHints(kind?: AskListKind): string[] {
	if (kind === 'token') {
		return [
			'ask --scope setup "" -- inspect project bootstrap status',
			'check <theme.css> -- validate token overrides after editing'
		];
	}

	return [
		'ask --scope component "<Component>" -- inspect a specific component in full',
		'check <file.svelte> -- validate the implementation after editing'
	];
}

function collectAntiPatterns(
	spec: AskSpec,
	componentName: string
): readonly CompositionComponentDef['antiPatterns'][number][] {
	const components = spec.composition?.components;
	if (!components) return [];
	for (const def of Object.values(components)) {
		if (def.component === componentName) return def.antiPatterns;
	}
	return [];
}

function renderComponentResult(
	name: string,
	def: ComponentDef,
	antiPatterns: readonly CompositionComponentDef['antiPatterns'][number][],
	installPlanText: string | null
): string {
	const lines: string[] = [
		'kind: component',
		header('matches', 1, ['name', 'category', 'compound', 'description']),
		row(name, def.category, def.compound, cap(def.description))
	];

	if (antiPatterns.length > 0) {
		lines.push('', header('anti-patterns', antiPatterns.length, ['pattern', 'reason', 'fix']));
		for (const antiPattern of antiPatterns) {
			lines.push(row(cap(antiPattern.pattern), cap(antiPattern.reason), cap(antiPattern.fix)));
		}
	}

	lines.push('', codeBlock('details', toonComponent(name, def, { includeHelp: false })));

	if (installPlanText) {
		lines.push('', codeBlock('install-plan', installPlanText));
	}

	lines.push(
		'',
		formatHelp([
			`ask --scope recipe "${name.toLowerCase()}" -- see higher-level patterns that use this component`,
			'check <file.svelte> -- validate the implementation after editing'
		])
	);

	return lines.join('\n');
}

function renderRecipeResult(query: string, recipes: readonly CompositionRecipeDef[]): string {
	if (recipes.length === 0) {
		return [
			'kind: recipe',
			`matches[0]: none for "${query}"`,
			formatHelp([
				`ask --scope component "${query}" -- inspect a specific component instead`,
				`ask --scope list "${query}" -- browse matching components and tokens`
			])
		].join('\n');
	}

	const lines: string[] = [
		'kind: recipe',
		header('matches', recipes.length, ['name', 'components', 'description'])
	];

	for (const recipe of recipes) {
		lines.push(row(recipe.name, recipe.components.join('|'), cap(recipe.description)));
	}

	for (const recipe of recipes) {
		const snippet =
			recipe.snippet.length <= SNIPPET_CAP
				? recipe.snippet
				: `${recipe.snippet.slice(0, SNIPPET_CAP - 1)}…`;
		lines.push('', codeBlock(`recipe:${recipe.name}`, snippet));
	}

	lines.push(
		'',
		formatHelp([
			'ask --scope component "<Component>" -- inspect one component from the recipe before writing code',
			'check <file.svelte> -- validate the implementation after editing'
		])
	);

	return lines.join('\n');
}

function buildListRows(spec: AskSpec, query: string, kind?: AskListKind) {
	const normalized = query.trim().toLowerCase();
	const componentRows: Array<[string, string, string, string]> = [];
	const tokenRows: Array<[string, string, string, string]> = [];

	if (kind !== 'token') {
		for (const [name, def] of Object.entries(spec.components)) {
			const haystack = [name, def.category, def.description, ...def.tags].join(' ').toLowerCase();
			if (normalized && !haystack.includes(normalized)) continue;
			componentRows.push(['component', name, def.category, cap(def.description)]);
		}
	}

	if (kind !== 'component') {
		const tokenResult = extractTokens();
		for (const token of tokenResult.tokens) {
			const haystack = [token.name, token.category, token.light, token.dark]
				.join(' ')
				.toLowerCase();
			if (normalized && !haystack.includes(normalized)) continue;
			tokenRows.push([
				'token',
				token.name,
				token.category,
				cap(`light:${token.light} | dark:${token.dark}`)
			]);
		}
	}

	return {
		componentRows: componentRows.sort((left, right) => left[1].localeCompare(right[1])),
		tokenRows: tokenRows.sort((left, right) => left[1].localeCompare(right[1]))
	};
}

function renderBuiltListResult(
	query: string,
	rows: ReturnType<typeof buildListRows>,
	kind?: AskListKind
): string {
	const matches = [...rows.componentRows, ...rows.tokenRows];
	const lines: string[] = ['kind: list'];

	if (matches.length === 0) {
		lines.push(`matches[0]: none${query ? ` for "${query}"` : ''}`);
		lines.push(formatHelp(listHints(kind)));
		return lines.join('\n');
	}

	lines.push(header('matches', matches.length, ['kind', 'name', 'category', 'detail']));
	for (const match of matches) {
		lines.push(row(...match));
	}

	lines.push('', formatHelp(listHints(kind)));
	return lines.join('\n');
}

function renderSetupResult(planText: string): string {
	return [
		'kind: setup-plan',
		codeBlock('details', planText),
		'',
		formatHelp([
			'check -- validate the workspace after completing setup steps',
			'ask --scope component "Button" -- inspect a component to add next'
		])
	].join('\n');
}

function ensureQuery(scope: AskScope, query: string): string {
	const trimmed = query.trim();
	if (scope === 'setup') return trimmed;
	if (trimmed.length > 0) return trimmed;

	throw new StructuredToolError(
		'missing-query',
		`The "${scope}" scope requires a non-empty query.`,
		[`ask --scope ${scope} "<query>"`, 'ask --scope list ""']
	);
}

export function runAsk(spec: AskSpec, input: AskInput, options: AskOptions = {}): string {
	switch (input.scope) {
		case 'component': {
			const query = ensureQuery('component', input.query);
			const result = findComponent(query, spec.components);
			if (!result) {
				throw new StructuredToolError('unknown-component', `Unknown component: "${query}"`, [
					`ask --scope list "${query}"`,
					`ask --scope recipe "${query}"`
				]);
			}

			const antiPatterns = collectAntiPatterns(spec, result.name);
			const planOptions = options.cwd ? ({ cwd: options.cwd } satisfies PlanAddOptions) : {};
			const addPlan = planAdd(spec, result.name, planOptions);
			const installPlanText = addPlan.installPlan.steps.length > 0 ? toonAddPlan(addPlan) : null;

			return renderComponentResult(result.name, result.def, antiPatterns, installPlanText);
		}

		case 'recipe': {
			const query = ensureQuery('recipe', input.query);
			const results = spec.composition
				? searchComposition(spec.composition, query)
				: { componentMatches: [], recipeMatches: [] };
			return renderRecipeResult(query, results.recipeMatches);
		}

		case 'list': {
			const rows = buildListRows(spec, input.query, input.kind);
			return renderBuiltListResult(input.query, rows, input.kind);
		}

		case 'setup': {
			const installPlan = planInstall(spec, options.cwd);
			return renderSetupResult(toonInstallPlan(installPlan, { includeHelp: false }));
		}
	}
}
