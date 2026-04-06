import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { reviewComponent, type ComponentDef as ReviewComponentDef } from './reviewer.js';
import { diagnoseTheme } from './theme-checker.js';
import {
	detectProject,
	planAdd,
	planInstall,
	type PlanAddOptions,
	type ProjectPlannerSpec
} from './project-planner.js';
import { scanWorkspace, type WorkspaceAuditSpec } from './workspace-audit.js';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import type { ComponentDef } from './spec-types.js';
import {
	findComponent,
	formatCompound,
	formatSimple,
	pad
} from './spec-formatters.js';

const require = createRequire(import.meta.url);
const _pkg: unknown = require('../package.json');
const version =
	typeof _pkg === 'object' && _pkg !== null && 'version' in _pkg ? String(_pkg.version) : '0.0.0';
const specPath = new URL('./spec.json', import.meta.url);

type RuntimeSpec = ProjectPlannerSpec &
	WorkspaceAuditSpec &
	Record<string, unknown> & {
		components: Record<string, ReviewComponentDef>;
	};

function loadRuntimeSpec(): RuntimeSpec {
	return JSON.parse(readFileSync(specPath, 'utf-8')) as RuntimeSpec;
}

let cachedSpec: RuntimeSpec | null = null;
function getSpec(): RuntimeSpec {
	if (!cachedSpec) {
		cachedSpec = loadRuntimeSpec();
	}
	return cachedSpec;
}

function toolError(e: unknown) {
	const message = e instanceof Error ? e.message : String(e);
	return {
		content: [{ type: 'text' as const, text: 'Error: ' + message }],
		isError: true as const
	};
}

const SERVER_INSTRUCTIONS = [
	'DryUI is a zero-dependency Svelte 5 component library. Follow these rules:',
	'',
	'1. SET UP THE APP SHELL FIRST: Run `compose "app shell"` to get the root layout template.',
	'   Your +layout.svelte must import the theme CSS, and app.html needs <html class="theme-auto">.',
	'',
	'2. PAGE LAYOUT: Use PageHeader.Root + Container + Stack for page structure.',
	'   This gives you a header, constrained content width, and vertical rhythm.',
	'',
	'3. CORRECT CSS TOKENS: Background is --dry-color-bg-base (not --dry-color-bg).',
	'   Text is --dry-color-text-strong (not --dry-color-text). See compose "app shell" for the full reset.',
	'',
	'4. COMPOUND COMPONENTS: Most components use compound syntax (e.g. Card.Root + Card.Content,',
	'   not <Card title="...">). Always call `info <Component>` to check the API before using one.',
	'',
	'5. COMPOSE OUTPUT IS DEVELOPER GUIDANCE: Recipe names, descriptions, and component lists from',
	'   the compose tool are instructions for YOU, not content for the page. Never render them as',
	'   visible text in the UI. Only use the code snippets from compose output.',
	'',
	'6. USE DRYUI LAYOUT COMPONENTS, NOT CUSTOM CSS: Grid instead of `display: grid`, Flex instead',
	'   of `display: flex`, Stack instead of vertical flex. Use Field.Root + Label for form fields,',
	'   Button instead of raw `<button>`. Never write custom CSS for layout, spacing, or form',
	'   structure when a DryUI component exists.'
].join('\n');

const server = new McpServer(
	{ name: '@dryui/mcp', version },
	{
		instructions: SERVER_INSTRUCTIONS
	}
);

const REVIEW_DESC = [
	'Review Svelte components for DryUI spec compliance, structural issues, and style suggestions.\n\n',
	'BEFORE CALLING THIS TOOL: Search the project for CSS files containing --dry-color- or --dry- variable overrides (e.g., global.css, app.css, theme files, layout files). If found, read that CSS and pass it as the `projectCss` parameter. This auto-diagnoses contrast, transparency, and missing token issues alongside the component review.\n\n',
	'Input: Raw Svelte component source code as a string.\n',
	'Checks:\n',
	'- **Errors:** Bare compound components (<Card> instead of <Card.Root>), unknown components, invalid props/parts, missing required props\n',
	'- **Warnings:** Orphaned compound parts, missing accessible labels, Avatar without alt/fallback, missing theme CSS import when DryUI components are used\n',
	'- **Suggestions:** Manual flex/grid where DryUI layout components apply, hardcoded colors, raw <hr> instead of <Separator>\n\n',
	'Output: JSON with issues array and summary. When projectCss is provided, theme diagnosis results are included.\n\n',
	'Example:\n\n',
	'```svelte\n<script>\n  import { Card, Badge } from \'@dryui/ui\';\n</script>\n\n<Card>\n  <Card.Header>Status</Card.Header>\n  <Card.Content>\n    <Badge variant="solid">Active</Badge>\n  </Card.Content>\n</Card>\n<hr />\n```\n\n',
	'Output:\n\n',
	'```json\n{\n  "issues": [\n    {\n      "severity": "error",\n      "code": "bare-compound",\n      "message": "Card is a compound component — use <Card.Root> instead of <Card>",\n      "line": 5\n    },\n    {\n      "severity": "suggestion",\n      "code": "prefer-separator",\n      "message": "Use <Separator /> instead of raw <hr>",\n      "line": 11\n    }\n  ],\n  "summary": "1 error, 0 warnings, 1 suggestion"\n}\n```'
].join('\n');

const DIAGNOSE_DESC = [
	'Diagnose DryUI theme CSS for missing tokens, value errors, contrast issues, and component token problems.\n',
	'Input: Raw CSS string or file path containing --dry-* variable overrides.\n',
	'Checks (progressive tiers):\n',
	'- **Errors:** Missing required semantic/theme tokens, wrong value types (e.g., length where color expected)\n',
	'- **Warnings:** Transparent/low-opacity surfaces (cards invisible), low text/background contrast, no visual elevation between surface and surface-raised, missing color pairings (primary without on-primary), component token overrides that break visibility\n',
	'- **Info:** Unresolvable var() references, dark/light theme inconsistencies\n\n',
	'When to use:\n',
	'- Before generating DryUI components for a brownfield project with custom --dry-* overrides\n',
	'- After a user reports visual issues (washed-out cards, invisible text, no elevation)\n',
	'- To validate a custom theme before shipping\n\n',
	'Output: JSON with variables summary, issues array (severity + code + variable + message + fix), and summary string.\n\n',
	'Example:\n\n',
	'```css\n:root {\n  --dry-color-surface-raised: rgba(217,158,100,0.07);\n  --dry-color-text: #f0e4d6;\n  --dry-color-bg: #16131a;\n}\n```\n\n',
	'Output includes: warning "transparent-surface" for surface-raised (alpha 0.07), error "missing-token" for undefined required tokens.\n'
].join('');

server.tool(
	'review',
	REVIEW_DESC,
	{
		code: z.string(),
		filename: z.string().optional(),
		projectCss: z
			.string()
			.optional()
			.describe(
				'Project CSS with --dry-* overrides — auto-diagnosed for theme issues alongside component review'
			)
	},
	async ({ code, filename, projectCss }) => {
		try {
			const spec = getSpec();
			const parts: Array<{ type: 'text'; text: string }> = [];
			const result = reviewComponent(code, spec, filename);
			parts.push({ type: 'text', text: JSON.stringify(result, null, 2) });

			if (projectCss) {
				const diagnosis = diagnoseTheme(projectCss, spec);
				if (diagnosis.issues.length > 0) {
					parts.push({
						type: 'text',
						text:
							'\n\n--- THEME DIAGNOSIS ---\nThe project CSS has issues that will affect how DryUI components render:\n\n' +
							JSON.stringify(diagnosis, null, 2)
					});
				}
			}

			return { content: parts };
		} catch (e) {
			return toolError(e);
		}
	}
);

server.tool(
	'diagnose',
	DIAGNOSE_DESC,
	{
		css: z.string().optional().describe('Raw CSS containing --dry-* overrides'),
		path: z.string().optional().describe('File path to CSS file')
	},
	async ({ css, path }) => {
		try {
			if (path && !path.endsWith('.css')) {
				return {
					content: [{ type: 'text', text: 'Error: Path must be a .css file' }],
					isError: true
				};
			}
			const content = css ?? (path ? readFileSync(path, 'utf-8') : null);
			if (!content) {
				return {
					content: [{ type: 'text', text: 'Error: Provide either css or path' }],
					isError: true
				};
			}
			const result = diagnoseTheme(content, getSpec());
			return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
		} catch (e) {
			return toolError(e);
		}
	}
);

const DETECT_PROJECT_DESC = [
	'Detect DryUI adoption readiness in a Svelte or SvelteKit project.\n\n',
	'Input: Optional cwd or project path.\n',
	'Output: JSON describing framework, package manager, DryUI dependencies, theme imports, theme-auto status, key file paths, and warnings.\n\n',
	'Use this before planning installation or project-aware component adoption.'
].join('');

server.tool(
	'detect_project',
	DETECT_PROJECT_DESC,
	{
		cwd: z.string().optional().describe('Project root or any path inside the project')
	},
	async ({ cwd }) => {
		try {
			const result = detectProject(getSpec(), cwd);
			return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
		} catch (e) {
			return toolError(e);
		}
	}
);

const PLAN_INSTALL_DESC = [
	'Create a plan-first DryUI install checklist for a Svelte or SvelteKit project.\n\n',
	'Input: Optional cwd or project path.\n',
	'Output: JSON with project detection plus ordered install steps. The result never mutates files.\n\n',
	'Use this to prepare a repo for DryUI before inserting components.'
].join('');

server.tool(
	'plan_install',
	PLAN_INSTALL_DESC,
	{
		cwd: z.string().optional().describe('Project root or any path inside the project')
	},
	async ({ cwd }) => {
		try {
			const result = planInstall(getSpec(), cwd);
			return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
		} catch (e) {
			return toolError(e);
		}
	}
);

const PLAN_ADD_DESC = [
	'Create a plan-first DryUI component or composed-output adoption plan for a project.\n\n',
	'Input: Component/composed-output name plus optional cwd, target file path, subpath flag, and withTheme flag.\n',
	'Output: JSON with install prerequisites, chosen import/source, target suggestions, and next steps. The result never mutates files.\n\n',
	'Use this when an agent needs project-aware adoption guidance without editing the repo directly.'
].join('');

server.tool(
	'plan_add',
	PLAN_ADD_DESC,
	{
		name: z.string().describe('Component name or composed output name/slug'),
		cwd: z.string().optional().describe('Project root or any path inside the project'),
		target: z.string().optional().describe('Preferred target file path inside the project'),
		subpath: z
			.boolean()
			.optional()
			.describe('Use subpath imports for @dryui/ui components when possible'),
		withTheme: z
			.boolean()
			.optional()
			.describe('Reserved for callers that want theme imports included in planning context')
	},
	async ({ name, cwd, target, subpath, withTheme }) => {
		try {
			const options = {
				...(cwd ? { cwd } : {}),
				...(target ? { target } : {}),
				...(subpath !== undefined ? { subpath } : {}),
				...(withTheme !== undefined ? { withTheme } : {})
			} satisfies PlanAddOptions;
			const result = planAdd(getSpec(), name, options);
			return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
		} catch (e) {
			return toolError(e);
		}
	}
);

const WORKSPACE_SEVERITIES = ['error', 'warning', 'info'] as const;
const MAX_SEVERITY_SCHEMA = z
	.enum(WORKSPACE_SEVERITIES)
	.optional()
	.describe('Filter results to this severity and higher-priority findings');

const DOCTOR_DESC = [
	'Audit a DryUI workspace and return a structured health report.\n\n',
	'Input: Optional cwd/path plus include/exclude globs, maxSeverity, and changed-only filtering.\n',
	'Output: JSON WorkspaceReport with detected projects, ordered findings, summary counts, and scan warnings.\n\n',
	'Use this for repo-wide health summaries across Svelte files, theme CSS, and project setup.'
].join('');

server.tool(
	'doctor',
	DOCTOR_DESC,
	{
		cwd: z.string().optional().describe('Project root or any path inside the workspace'),
		include: z.array(z.string()).optional().describe('Repeatable include globs resolved from cwd'),
		exclude: z.array(z.string()).optional().describe('Repeatable exclude globs resolved from cwd'),
		maxSeverity: MAX_SEVERITY_SCHEMA,
		changed: z
			.boolean()
			.optional()
			.describe('Limit the scan to modified, staged, and untracked files relative to HEAD')
	},
	async ({ cwd, include, exclude, maxSeverity, changed }) => {
		try {
			const result = scanWorkspace(getSpec(), {
				...(cwd ? { cwd } : {}),
				...(include ? { include } : {}),
				...(exclude ? { exclude } : {}),
				...(maxSeverity ? { maxSeverity } : {}),
				...(changed !== undefined ? { changed } : {})
			});
			return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
		} catch (e) {
			return toolError(e);
		}
	}
);

const LINT_DESC = [
	'Lint a DryUI workspace and return deterministic workspace findings.\n\n',
	'Input: Optional cwd/path plus include/exclude globs, maxSeverity, and changed-only filtering.\n',
	'Output: JSON WorkspaceReport with sorted findings that can be consumed by scripts or agents.\n\n',
	'Use this when you need machine-oriented DryUI audit output for CI or automation.'
].join('');

server.tool(
	'lint',
	LINT_DESC,
	{
		cwd: z.string().optional().describe('Project root or any path inside the workspace'),
		include: z.array(z.string()).optional().describe('Repeatable include globs resolved from cwd'),
		exclude: z.array(z.string()).optional().describe('Repeatable exclude globs resolved from cwd'),
		maxSeverity: MAX_SEVERITY_SCHEMA,
		changed: z
			.boolean()
			.optional()
			.describe('Limit the scan to modified, staged, and untracked files relative to HEAD')
	},
	async ({ cwd, include, exclude, maxSeverity, changed }) => {
		try {
			const result = scanWorkspace(getSpec(), {
				...(cwd ? { cwd } : {}),
				...(include ? { include } : {}),
				...(exclude ? { exclude } : {}),
				...(maxSeverity ? { maxSeverity } : {}),
				...(changed !== undefined ? { changed } : {})
			});
			return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
		} catch (e) {
			return toolError(e);
		}
	}
);

// Helpers for info / list tools — shared with @dryui/cli via spec-types and spec-formatters.

function getComponents(): Record<string, ComponentDef> {
	return getSpec().components as Record<string, ComponentDef>;
}

// info tool

const INFO_DESC = [
	'Look up the full API reference for a DryUI component.\n\n',
	'Input: Component name (case-insensitive, e.g. "Button", "card").\n',
	'Output: Formatted text showing name, description, category, tags, import statement, ',
	'whether it is compound or simple, root and subpath imports when available, all props ',
	'(with type, accepted values when known, required, bindable, default, and notes), native/rest-prop forwarding, ',
	'compound structure guidance, CSS variables, data attributes, and example code.\n\n',
	'Use this tool to understand what the component supports before generating code.'
].join('');

server.tool(
	'info',
	INFO_DESC,
	{
		name: z.string().describe('Component name (case-insensitive)')
	},
	async ({ name }) => {
		try {
			const components = getComponents();
			const result = findComponent(name, components);
			if (!result) {
				const available = Object.keys(components).sort();
				return {
					content: [
						{
							type: 'text',
							text: `Unknown component: "${name}"\n\nAvailable components:\n  ${available.join(', ')}`
						}
					],
					isError: true
				};
			}
			const { name: canonical, def } = result;
			const output = def.compound ? formatCompound(canonical, def) : formatSimple(canonical, def);
			return { content: [{ type: 'text', text: output }] };
		} catch (e) {
			return toolError(e);
		}
	}
);

// list tool

const LIST_DESC = [
	'List available DryUI components.\n\n',
	'Input: Optional category name to filter results.\n',
	'Output: Components grouped by category.\n\n',
	'Use this tool to discover which components are available before looking up details with the info tool.'
].join('');

server.tool(
	'list',
	LIST_DESC,
	{
		category: z.string().optional().describe('Filter by category name (case-insensitive)')
	},
	async ({ category }) => {
		try {
			const components = getComponents();
			const entries = Object.entries(components);
			const groups: Record<string, Array<{ name: string; description: string }>> = {};
			for (const [name, def] of entries) {
				const cat = def.category;
				if (category && cat.toLowerCase() !== category.toLowerCase()) continue;
				(groups[cat] ??= []).push({ name, description: def.description });
			}

			if (Object.keys(groups).length === 0) {
				const allCats = [...new Set(entries.map(([, d]) => d.category))].sort();
				return {
					content: [
						{
							type: 'text',
							text: `No components found for category: "${category}"\n\nAvailable categories:\n  ${allCats.join(', ')}`
						}
					],
					isError: true
				};
			}

			const lines: string[] = [];
			const sortedCats = Object.keys(groups).sort();
			for (const cat of sortedCats) {
				const items = groups[cat] ?? [];
				lines.push(`${cat.toUpperCase()}`);
				const maxNameLen = Math.max(...items.map((c) => c.name.length));
				for (const item of items) {
					lines.push(`  ${pad(item.name, maxNameLen + 2)}${item.description}`);
				}
				lines.push('');
			}

			return { content: [{ type: 'text', text: lines.join('\n').trimEnd() }] };
		} catch (e) {
			return toolError(e);
		}
	}
);

// compose tool

const COMPOSE_DESC = [
	'Look up composition guidance for building UIs with DryUI.\n\n',
	'Returns ranked component alternatives with code snippets, anti-patterns to avoid, and full composition recipes.\n',
	'Call this BEFORE writing any DryUI layout to ensure correct component selection.\n\n',
	'Input: Short keywords describing what you want to build. Use 1-3 words — component names, pattern names, or UI concepts.\n',
	'Good: "search form", "date input", "hotel card", "dashboard", "checkout", "travel booking"\n',
	'Bad: "Create a search page for a travel website" (too long, use keywords instead)\n\n',
	'If your first query returns no results, try shorter/different keywords. Query individual components separately.\n',
	'Output: Ranked alternatives with snippets, anti-patterns, and matching recipes.'
].join('');

type CompositionComponent = {
	component: string;
	useWhen: string;
	alternatives: Array<{ rank: number; component: string; useWhen: string; snippet: string }>;
	antiPatterns: Array<{ pattern: string; reason: string; fix: string }>;
	combinesWith: string[];
};

type CompositionRecipe = {
	name: string;
	description: string;
	tags: string[];
	components: string[];
	snippet: string;
};

type CompositionSpec = {
	components: Record<string, CompositionComponent>;
	recipes: Record<string, CompositionRecipe>;
};

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

function findComposition(query: string) {
	const compositionData = getSpec().composition as CompositionSpec | undefined;
	if (!compositionData)
		return {
			componentMatches: [] as CompositionComponent[],
			recipeMatches: [] as CompositionRecipe[]
		};

	const q = query.toLowerCase();
	const tokens = tokenize(query);

	// Try exact substring first (original behavior for precise queries)
	const exactComponentMatches: CompositionComponent[] = [];
	const exactRecipeMatches: CompositionRecipe[] = [];

	for (const comp of Object.values(compositionData.components)) {
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

	for (const recipe of Object.values(compositionData.recipes)) {
		if (
			recipe.name.toLowerCase().includes(q) ||
			recipe.description.toLowerCase().includes(q) ||
			recipe.tags.some((t) => t.toLowerCase().includes(q)) ||
			recipe.components.some((c) => c.toLowerCase().includes(q))
		) {
			exactRecipeMatches.push(recipe);
		}
	}

	// If exact matching found results, return them
	if (exactComponentMatches.length || exactRecipeMatches.length) {
		return { componentMatches: exactComponentMatches, recipeMatches: exactRecipeMatches };
	}

	// Fall back to token-based scoring
	if (!tokens.length)
		return {
			componentMatches: [] as CompositionComponent[],
			recipeMatches: [] as CompositionRecipe[]
		};

	const scoredComponents: Array<{ comp: CompositionComponent; score: number }> = [];
	for (const comp of Object.values(compositionData.components)) {
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

	const scoredRecipes: Array<{ recipe: CompositionRecipe; score: number }> = [];
	for (const recipe of Object.values(compositionData.recipes)) {
		const corpus = [recipe.name, recipe.description, ...recipe.tags, ...recipe.components].join(
			' '
		);
		const score = scoreText(tokens, corpus);
		if (score > 0) scoredRecipes.push({ recipe, score });
	}

	// Sort by score descending, take top results
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

function formatCompositionResult(results: {
	componentMatches: CompositionComponent[];
	recipeMatches: CompositionRecipe[];
}): string {
	const lines: string[] = [];

	for (const comp of results.componentMatches) {
		lines.push(`── ${comp.component} ──────────────────────────────`);
		lines.push(`[DEV GUIDANCE — do not render as page content]`);
		lines.push(`Use: ${comp.component} — ${comp.useWhen}`);
		lines.push('');

		for (const alt of comp.alternatives) {
			lines.push(`  ${alt.rank}. ${alt.component} (${alt.useWhen})`);
			lines.push(
				alt.snippet
					.split('\n')
					.map((l) => `     ${l}`)
					.join('\n')
			);
			lines.push('');
		}

		for (const ap of comp.antiPatterns) {
			lines.push(`⚠ Anti-pattern: ${ap.pattern}`);
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

const COMPOSE_PREAMBLE = [
	"\u26A0 SETUP: Your root +layout.svelte must import '@dryui/ui/themes/default.css'",
	'  and \'@dryui/ui/themes/dark.css\'. app.html needs <html class="theme-auto">.',
	'  If not set up yet, run: compose "app shell"',
	'',
	'\u26A0 THIS OUTPUT IS DEVELOPER GUIDANCE — do NOT render recipe names, descriptions,',
	'  or component lists as visible page content. Only use the code snippets.',
	'',
	''
].join('\n');

server.tool(
	'compose',
	COMPOSE_DESC,
	{
		query: z
			.string()
			.describe(
				'Short keywords: component name, pattern name, or UI concept (e.g. "search form", "date input", "hotel card", "dashboard")'
			)
	},
	async ({ query }) => {
		try {
			const results = findComposition(query);

			if (!results.componentMatches.length && !results.recipeMatches.length) {
				return {
					content: [
						{
							type: 'text',
							text: `No composition guidance found for "${query}".\n\nTry:\n- A component name (e.g. "DatePicker", "Avatar")\n- A UI concept (e.g. "date input", "image placeholder")\n- A pattern name (e.g. "search-form", "dashboard-page")`
						}
					]
				};
			}

			return {
				content: [
					{
						type: 'text',
						text: COMPOSE_PREAMBLE + formatCompositionResult(results)
					}
				]
			};
		} catch (e) {
			return toolError(e);
		}
	}
);

// ── MCP Prompts (surface as slash commands in Cursor / other MCP clients) ──

server.registerPrompt(
	'dryui-compose',
	{
		title: 'DryUI Compose',
		description: 'Find which DryUI components to use for a UI task',
		argsSchema: {
			query: z
				.string()
				.describe('What you want to build (e.g. "pricing page", "settings form", "date input")')
		}
	},
	async ({ query }) => {
		const results = findComposition(query);
		const text =
			results.componentMatches.length || results.recipeMatches.length
				? formatCompositionResult(results)
				: `No composition guidance found for "${query}". Try a component name, UI concept, or pattern name.`;

		return {
			messages: [
				{
					role: 'user',
					content: { type: 'text', text: `Which DryUI components should I use to build: ${query}` }
				},
				{ role: 'assistant', content: { type: 'text', text } }
			]
		};
	}
);

server.registerPrompt(
	'dryui-info',
	{
		title: 'DryUI Info',
		description: 'Look up the full API reference for a DryUI component',
		argsSchema: {
			name: z.string().describe('Component name (e.g. "Button", "Card", "Accordion")')
		}
	},
	async ({ name }) => {
		const components = getComponents();
		const result = findComponent(name, components);
		let text: string;
		if (result) {
			const { name: canonical, def } = result;
			text = def.compound ? formatCompound(canonical, def) : formatSimple(canonical, def);
		} else {
			text = `Unknown component: "${name}"\n\nAvailable: ${Object.keys(components).sort().join(', ')}`;
		}

		return {
			messages: [
				{
					role: 'user',
					content: { type: 'text', text: `Show me the DryUI API reference for: ${name}` }
				},
				{ role: 'assistant', content: { type: 'text', text } }
			]
		};
	}
);

server.registerPrompt(
	'dryui-list',
	{
		title: 'DryUI List',
		description: 'List available DryUI components by category',
		argsSchema: {
			category: z
				.string()
				.optional()
				.describe('Filter by category (e.g. "layout", "feedback", "form")')
		}
	},
	async ({ category }) => {
		const components = getComponents();
		const lines: string[] = [];
		const grouped: Record<string, string[]> = {};
		for (const [name, def] of Object.entries(components)) {
			if (category && def.category.toLowerCase() !== category.toLowerCase()) continue;
			(grouped[def.category] ??= []).push(name);
		}
		for (const [cat, names] of Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))) {
			lines.push(`${cat}: ${names.sort().join(', ')}`);
		}
		const text =
			lines.length > 0 ? lines.join('\n') : `No components found for category "${category}".`;

		return {
			messages: [
				{
					role: 'user',
					content: {
						type: 'text',
						text: category ? `List DryUI ${category} components` : 'List all DryUI components'
					}
				},
				{ role: 'assistant', content: { type: 'text', text } }
			]
		};
	}
);

server.registerPrompt(
	'dryui-review',
	{
		title: 'DryUI Review',
		description: 'Validate a Svelte component against DryUI specs'
	},
	async () => {
		return {
			messages: [
				{
					role: 'user',
					content: {
						type: 'text',
						text: 'Review the current Svelte file for DryUI spec compliance. Read the file contents and pass them to the `review` tool, along with any project CSS containing --dry-* overrides.'
					}
				}
			]
		};
	}
);

server.registerPrompt(
	'dryui-install',
	{
		title: 'DryUI Install',
		description: 'Plan a DryUI installation for the current project',
		argsSchema: {
			cwd: z.string().optional().describe('Project root or any path inside the project')
		}
	},
	async ({ cwd }) => {
		const result = planInstall(getSpec(), cwd);
		return {
			messages: [
				{
					role: 'user',
					content: { type: 'text', text: 'Plan the DryUI installation for this project.' }
				},
				{ role: 'assistant', content: { type: 'text', text: JSON.stringify(result, null, 2) } }
			]
		};
	}
);

server.registerPrompt(
	'dryui-add',
	{
		title: 'DryUI Add',
		description: 'Plan project-aware adoption of a DryUI component or composed output',
		argsSchema: {
			name: z.string().describe('Component or composed output name'),
			cwd: z.string().optional().describe('Project root or any path inside the project'),
			target: z.string().optional().describe('Preferred target file path')
		}
	},
	async ({ name, cwd, target }) => {
		const options = {
			...(cwd ? { cwd } : {}),
			...(target ? { target } : {})
		} satisfies PlanAddOptions;
		const result = planAdd(getSpec(), name, options);
		return {
			messages: [
				{
					role: 'user',
					content: { type: 'text', text: `Plan how to add ${name} to this project.` }
				},
				{ role: 'assistant', content: { type: 'text', text: JSON.stringify(result, null, 2) } }
			]
		};
	}
);

server.registerPrompt(
	'dryui-diagnose',
	{
		title: 'DryUI Diagnose',
		description: 'Validate theme CSS for missing tokens, contrast issues, and errors'
	},
	async () => {
		return {
			messages: [
				{
					role: 'user',
					content: {
						type: 'text',
						text: 'Diagnose my theme CSS for DryUI issues. Find CSS files containing --dry-* variable overrides and pass them to the `diagnose` tool to check for missing tokens, contrast problems, and value errors.'
					}
				}
			]
		};
	}
);

await server.connect(new StdioServerTransport());
