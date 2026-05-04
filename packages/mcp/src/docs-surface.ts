/**
 * Canonical manifest of DryUI first-party docs and agent editor support.
 *
 * Keeps one source of truth for:
 *  - the docs IA (`/`, `/getting-started`, …) that `search.ts`,
 *    the llms.txt generator, and the nightly drift checks all consume
 *  - the canonical agent IDs (`claude-code`, `codex`, `gemini`, …) that the
 *    docs site renders setup cards for, and which agent setup surfaces must
 *    not drift against
 *  - the docs allowlist agents are told to trust in generated prompt bundles
 *    (re-exported from `ai-surface.ts` for convenience)
 *
 * Consumers:
 *  - `apps/docs/src/lib/search.ts` and `apps/docs/src/lib/ai-setup.ts` import
 *    the agent IDs + route list
 *  - `packages/mcp/src/generate-llms-txt.ts` inlines the route list
 *  - `tests/unit/docs-surface.test.ts` cross-checks every entry against the
 *    filesystem and `ai-setup.ts` / plugin manifests
 */
import { aiSurface } from './ai-surface.js';

export type AgentId =
	| 'claude-code'
	| 'codex'
	| 'gemini'
	| 'opencode'
	| 'copilot'
	| 'cursor'
	| 'windsurf'
	| 'zed';

/**
 * Canonical agent IDs DryUI ships editor-setup guidance for. Ordering is the
 * display order on the docs getting-started page.
 */
export const AGENT_IDS: readonly AgentId[] = [
	'claude-code',
	'codex',
	'gemini',
	'opencode',
	'copilot',
	'cursor',
	'windsurf',
	'zed'
] as const;

/**
 * First-party docs routes. Paths are SvelteKit route URLs; the parity test
 * checks that every route has a corresponding apps/docs/src/routes/_/+page.svelte.
 *
 * Component detail pages live at `/components/[slug]`; the component slugs
 * themselves come from spec.json at generate time rather than DOCS_ROUTES.
 */
export interface DocsRoute {
	readonly path: string;
	readonly label: string;
	readonly description: string;
	readonly keywords?: readonly string[];
}

export const DOCS_ROUTES: readonly DocsRoute[] = [
	{
		path: '/',
		label: 'Home',
		description: 'Human-led, agent-assisted UI for reusable components, themes, and route patterns',
		keywords: ['index', 'overview', 'landing', 'human-led', 'agent-assisted']
	},
	{
		path: '/getting-started',
		label: 'Getting Started',
		description: 'Install the DryUI skill, wire the app, add themes, and build with components',
		keywords: ['install', 'setup', 'skill', 'theme', 'quickstart']
	}
];

export const DOCS_ROUTE_PATHS = DOCS_ROUTES.map((r) => r.path);

/**
 * Docs allowlist for generated prompt bundles. Re-exported here so consumers
 * can import a single docs-surface module and avoid reaching into ai-surface's
 * prompt bundle structure directly.
 */
export const DOCS_ALLOWLIST: readonly string[] = aiSurface.promptBundles[0]?.docsAllowlist ?? [];
