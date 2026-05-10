import type { ScenarioDefinition } from '../../../scripts/e2e/scenario-harness.ts';
import { mockupPath } from './mockups.ts';

const dashboardMockup = mockupPath('dashboard');

export const dashboardScenario: ScenarioDefinition = {
	name: 'dashboard',
	prompt: [
		'Use the dryui-build skill to build a simple admin dashboard. Heading: "Analytics Dashboard". Sidebar: Overview, Analytics, Customers, Billing, Settings. Metrics: Revenue, Active Users, Conversions, Uptime. Recent Activity section.',
		`Use this local design mockup as a loose visual reference for layout, density, hierarchy, and tone: ${dashboardMockup}. Keep the textual requirements above authoritative if the mockup differs; do not try to match the mockup pixel-for-pixel.`,
		'Keep the implementation static and compact. Update only src/routes/+page.svelte and src/layout.css. In src/layout.css, use only structural layout rules: display, grid, flex, container, tokenized spacing, alignment, and block-size constraints. Put visual styling in the route style block with scoped selectors on native elements only. Do not use :global(), inline style attributes, style: directives, or class= on @dryui/ui components. Do not run the dev server; after a successful bun run build, finish.'
	].join(' '),
	codexTimeoutMs: 10 * 60 * 1_000,
	assertions: [
		{ kind: 'file-exists', path: 'src/routes/+page.svelte' },
		{ kind: 'file-contains', path: 'src/routes/+page.svelte', needle: 'Analytics Dashboard' },
		{ kind: 'file-contains', path: 'src/routes/+page.svelte', needle: '@dryui/ui' },
		{ kind: 'html-contains', needle: 'Analytics Dashboard' },
		{ kind: 'html-contains', needle: 'Revenue' },
		{ kind: 'html-contains', needle: 'Active Users' },
		{ kind: 'html-contains', needle: 'Conversions' },
		{ kind: 'html-contains', needle: 'Uptime' },
		{ kind: 'html-contains', needle: 'Recent Activity' },
		{ kind: 'html-contains', needle: 'Overview' },
		{ kind: 'html-contains', needle: 'Analytics' }
	]
};
