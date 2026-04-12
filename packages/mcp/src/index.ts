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
import type { ComponentDef, CompositionComponentDef, CompositionRecipeDef } from './spec-types.js';
import { findComponent, formatCompound, formatSimple } from './spec-formatters.js';
import { searchComposition, formatCompositionResult } from './composition-search.js';
import {
	toonComponent,
	toonComponentList,
	toonComposition,
	toonReviewResult,
	toonDiagnoseResult,
	toonWorkspaceReport,
	toonProjectDetection,
	toonInstallPlan,
	toonAddPlan,
	toonTokens
} from './toon.js';
import { extractTokens, getTokenCategories } from './tokens.js';

const require = createRequire(import.meta.url);
const _pkg: unknown = require('../package.json');
const version =
	typeof _pkg === 'object' && _pkg !== null && 'version' in _pkg ? String(_pkg.version) : '0.0.0';
const specPath = new URL('./spec.json', import.meta.url);

type RuntimeSpec = ProjectPlannerSpec &
	WorkspaceAuditSpec &
	Record<string, unknown> & {
		components: Record<string, ReviewComponentDef>;
		composition?: {
			readonly components: Record<string, CompositionComponentDef>;
			readonly recipes: Record<string, CompositionRecipeDef>;
		};
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
	'OUTPUT FORMAT: All tool responses use TOON (token-optimized) format. Each response ends with',
	'  `next[]` suggesting logical next commands. Empty results show `issues[0]: clean` or similar.',
	'',
	'1. SET UP THE APP SHELL FIRST: Run `compose "app shell"` to get the root layout template.',
	'   Your +layout.svelte must import the theme CSS, and app.html needs <html class="theme-auto">.',
	'',
	'2. PAGE LAYOUT: Use CSS grid for layout — not flexbox. Use Container for constrained content',
	'   width. Use `@container` queries for responsive sizing (never `@media` for layout).',
	'',
	'3. CORRECT CSS TOKENS: Background is --dry-color-bg-base (not --dry-color-bg).',
	'   Text is --dry-color-text-strong (not --dry-color-text). See compose "app shell" for the full reset.',
	'',
	'4. COMPOUND COMPONENTS: Most components use compound syntax (e.g. Card.Root + Card.Content,',
	'   not <Card title="...">). Always call `info <Component>` or `compose "<query>"` first to',
	'   confirm kind, required parts, bindables, and canonical usage before writing code.',
	'',
	'5. COMPOSE OUTPUT IS DEVELOPER GUIDANCE: Recipe names, descriptions, and component lists from',
	'   the compose tool are instructions for YOU, not content for the page. Never render them as',
	'   visible text in the UI. Only use the code snippets from compose output.',
	'',
	'6. USE DRYUI COMPONENTS FOR UI ELEMENTS: Use Field.Root + Label for form fields, Button instead',
	'   of raw `<button>`, Separator instead of `<hr>`. Always call `info` or `compose` to check',
	'   if a DryUI component exists before writing raw HTML.'
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
	'- **Errors:** Bare compound components (<Card> instead of <Card.Root>), unknown components, invalid props/parts, missing required props, orphaned compound parts, missing accessible labels, Avatar without alt/fallback, raw `<hr>` instead of `<Separator />`, raw styled buttons instead of `<Button>`, custom field markup instead of `<Field.Root>`, custom max-width centering instead of `<Container>`, and custom layout code that ignores the CSS-grid baseline\n',
	'- **Suggestions:** Hardcoded colors, manual centering patterns, and custom `--dry-*` overrides that should be diagnosed separately\n\n',
	'Output: TOON format with issues, hasBlockers/autoFixable aggregates, and next-step suggestions. When projectCss is provided, theme diagnosis results are appended.\n\n',
	'Example:\n\n',
	'```svelte\n<script>\n  import { Card, Badge } from \'@dryui/ui\';\n</script>\n\n<Card>\n  <Card.Header>Status</Card.Header>\n  <Card.Content>\n    <Badge variant="solid">Active</Badge>\n  </Card.Content>\n</Card>\n<hr />\n```\n\n',
	'Output:\n\n',
	'```\nissues[2]{severity,line,code,message}:\n  error,5,bare-compound,Card is a compound component — use <Card.Root> instead of <Card>\n  error,11,prefer-separator,Raw <hr> element — use <Separator /> for consistent styling\nhasBlockers: true | autoFixable: 2\n2 errors, 0 warnings, 0 suggestions\n```'
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
	'Output: TOON format with token coverage percentage, issues, and next-step suggestions.\n\n',
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
			parts.push({ type: 'text', text: toonReviewResult(result) });

			if (projectCss) {
				const diagnosis = diagnoseTheme(projectCss, spec);
				if (diagnosis.issues.length > 0) {
					parts.push({
						type: 'text',
						text: '\n--- THEME DIAGNOSIS ---\n' + toonDiagnoseResult(diagnosis)
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
			return { content: [{ type: 'text', text: toonDiagnoseResult(result) }] };
		} catch (e) {
			return toolError(e);
		}
	}
);

const DETECT_PROJECT_DESC = [
	'Detect DryUI adoption readiness in a Svelte or SvelteKit project.\n\n',
	'Input: Optional cwd or project path.\n',
	'Output: TOON format with project status, framework, deps, theme state, and next-step suggestions.\n\n',
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
			return { content: [{ type: 'text', text: toonProjectDetection(result) }] };
		} catch (e) {
			return toolError(e);
		}
	}
);

const PLAN_INSTALL_DESC = [
	'Create a plan-first DryUI install checklist for a Svelte or SvelteKit project.\n\n',
	'Input: Optional cwd or project path.\n',
	'Output: TOON format with project detection plus ordered install steps. The result never mutates files.\n\n',
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
			return { content: [{ type: 'text', text: toonInstallPlan(result) }] };
		} catch (e) {
			return toolError(e);
		}
	}
);

const PLAN_ADD_DESC = [
	'Create a plan-first DryUI component or composed-output adoption plan for a project.\n\n',
	'Input: Component/composed-output name plus optional cwd, target file path, subpath flag, and withTheme flag.\n',
	'Output: TOON format with install prerequisites, chosen import/source, target suggestions, and next steps. The result never mutates files.\n\n',
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
			return { content: [{ type: 'text', text: toonAddPlan(result) }] };
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
	'Output: TOON format with top-rule aggregate, findings (capped at 50, use --full for all), and next-step suggestions.\n\n',
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
			return {
				content: [
					{
						type: 'text',
						text: toonWorkspaceReport(result, { title: 'doctor', command: 'doctor' })
					}
				]
			};
		} catch (e) {
			return toolError(e);
		}
	}
);

const LINT_DESC = [
	'Lint a DryUI workspace and return deterministic workspace findings.\n\n',
	'Input: Optional cwd/path plus include/exclude globs, maxSeverity, and changed-only filtering.\n',
	'Output: TOON format with sorted findings (capped at 50) and next-step suggestions.\n\n',
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
			return {
				content: [
					{ type: 'text', text: toonWorkspaceReport(result, { title: 'lint', command: 'lint' }) }
				]
			};
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
	'Input: Component name (case-insensitive, e.g. "Button", "card"). Accepts comma-separated names for batch lookup (e.g. "Button,Card,Select").\n',
	'Output: TOON format with props, structure, CSS vars, data attributes, truncated example, and next-step suggestions.\n\n',
	'Use this tool to understand what the component supports before generating code.'
].join('');

server.tool(
	'info',
	INFO_DESC,
	{
		name: z
			.string()
			.describe(
				'Component name (case-insensitive). Comma-separated for batch lookup (e.g. "Button,Card,Select")'
			)
	},
	async ({ name }) => {
		try {
			const components = getComponents();
			const names = name
				.split(',')
				.map((n) => n.trim())
				.filter(Boolean);

			if (names.length === 1) {
				// Single component lookup (original behavior)
				const result = findComponent(names[0]!, components);
				if (!result) {
					const available = Object.keys(components).sort();
					return {
						content: [
							{
								type: 'text',
								text: `Unknown component: "${names[0]}"\n\nAvailable components:\n  ${available.join(', ')}`
							}
						],
						isError: true
					};
				}
				const { name: canonical, def } = result;
				return { content: [{ type: 'text', text: toonComponent(canonical, def) }] };
			}

			// Batch lookup
			const parts: string[] = [];
			let hasErrors = false;

			for (const query of names) {
				const result = findComponent(query, components);
				if (!result) {
					hasErrors = true;
					const available = Object.keys(components).sort();
					parts.push(`error: Unknown component "${query}"\n  available: ${available.join(', ')}`);
				} else {
					const { name: canonical, def } = result;
					parts.push(toonComponent(canonical, def));
				}
			}

			return {
				content: [{ type: 'text', text: parts.join('\n---\n') }],
				...(hasErrors ? { isError: true } : {})
			};
		} catch (e) {
			return toolError(e);
		}
	}
);

// list tool

const LIST_DESC = [
	'List available DryUI components.\n\n',
	'Input: Optional category name to filter results.\n',
	'Output: TOON format with components listed as name, category, compound, description.\n\n',
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
			return { content: [{ type: 'text', text: toonComponentList(components, category) }] };
		} catch (e) {
			return toolError(e);
		}
	}
);

// tokens tool

const TOKENS_DESC = [
	'List available DryUI --dry-* CSS design tokens from the theme files.\n\n',
	'Input: Optional category name to filter results.\n',
	'Output: TOON format with tokens listed as name, category, light value, dark value.\n\n',
	'Use this tool to discover which CSS custom properties are available for theming and overrides.'
].join('');

server.tool(
	'tokens',
	TOKENS_DESC,
	{
		category: z
			.string()
			.optional()
			.describe(
				'Filter by category name (e.g. "color", "space", "radius", "shadow", "font", "type")'
			)
	},
	async ({ category }) => {
		try {
			const result = extractTokens(category ?? undefined);
			if (result.tokens.length === 0 && category) {
				const available = getTokenCategories();
				return {
					content: [
						{
							type: 'text',
							text: `tokens[0]: no matches for category "${category}"\navailable categories: ${available.join(', ')}`
						}
					],
					isError: true
				};
			}
			return { content: [{ type: 'text', text: toonTokens(result, category ?? undefined) }] };
		} catch (e) {
			return toolError(e);
		}
	}
);

// compose tool

const COMPOSE_DESC = [
	'Look up composition guidance for building UIs with DryUI.\n\n',
	'Returns ranked component alternatives with component-shape metadata, truncated code snippets, anti-patterns to avoid, and composition recipes in TOON format.\n',
	'Call this BEFORE writing any DryUI layout to ensure correct component selection.\n\n',
	'Input: Short keywords describing what you want to build. Use 1-3 words — component names, pattern names, or UI concepts.\n',
	'Good: "search form", "date input", "hotel card", "dashboard", "checkout", "travel booking"\n',
	'Bad: "Create a search page for a travel website" (too long, use keywords instead)\n\n',
	'If your first query returns no results, try shorter/different keywords. Query individual components separately.\n',
	'Output: Ranked alternatives with snippets, anti-patterns, and matching recipes.'
].join('');

function findComposition(query: string) {
	const compositionData = getSpec().composition;
	if (!compositionData) return { componentMatches: [], recipeMatches: [] };
	return searchComposition(compositionData, query);
}

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
							text: `matches[0]: none for "${query}"\nTry: component name (DatePicker, Avatar), UI concept (date input), or pattern (search-form)`
						}
					]
				};
			}

			return {
				content: [
					{
						type: 'text',
						text: toonComposition(results, getComponents())
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
				? formatCompositionResult(results, getComponents())
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
				{ role: 'assistant', content: { type: 'text', text: toonInstallPlan(result) } }
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
				{ role: 'assistant', content: { type: 'text', text: toonAddPlan(result) } }
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
