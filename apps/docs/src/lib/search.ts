import spec from '../../../../packages/mcp/src/spec.json' with { type: 'json' };
import { categories, toSlug } from '$lib/nav';

// spec.json is generated from per-component .meta.ts files and carries the
// same description/category/tags surface the old component-catalog exposed.
const componentMeta = spec.components as Record<
	string,
	{ description?: string; category?: string; tags?: string[] }
>;
interface SearchItem {
	label: string;
	href: string;
	description: string;
	keywords: string[];
}

interface SearchSection {
	heading: string;
	items: SearchItem[];
}

// Build-time route discovery — Vite resolves this at compile time so stale
// entries pointing to deleted routes are automatically filtered out.
const routeModules = import.meta.glob('/src/routes/**/+page.svelte');
const validRoutes = new Set(
	Object.keys(routeModules).map(
		(p) => p.replace('/src/routes', '').replace('/+page.svelte', '') || '/'
	)
);

const allDocsPages: SearchItem[] = [
	{
		label: 'Home',
		href: '/',
		description: 'Landing page for DryUI.',
		keywords: ['index', 'overview', 'landing']
	},
	{
		label: 'Getting Started',
		href: '/getting-started',
		description: 'Install DryUI, import the theme, and bootstrap your app.',
		keywords: ['install', 'setup', 'theme', 'quickstart']
	},
	{
		label: 'Theme Wizard',
		href: '/theme-wizard',
		description: 'Build and export DryUI semantic token themes.',
		keywords: [
			'tokens',
			'palette',
			'theme editor',
			'preset themes',
			'aurora',
			'midnight',
			'terminal'
		]
	},
	{
		label: 'Tools',
		href: '/tools',
		description: 'Install and use the DryUI CLI for setup, lookup, tokens, and feedback tooling.',
		keywords: [
			'cli',
			'install',
			'commands',
			'tooling',
			'terminal',
			'init',
			'detect',
			'install plan',
			'compose',
			'tokens',
			'feedback',
			'ambient'
		]
	},
	{
		label: 'Changelog',
		href: '/changelog',
		description: 'Release notes and recent changes.',
		keywords: ['releases', 'updates', 'versions']
	}
];

const docsPages = allDocsPages.filter((page) => validRoutes.has(page.href));

function getComponentItems(): SearchItem[] {
	return categories.flatMap((category) =>
		category.items.map((item) => {
			const keywords = [
				category.label.toLowerCase(),
				'component',
				item.kind,
				...(componentMeta[item.name]?.tags ?? [])
			];

			return {
				label: item.name,
				href: `/components/${toSlug(item.name)}`,
				description: `${category.label} component`,
				keywords: [...new Set(keywords)]
			};
		})
	);
}

export function getSearchSections(): SearchSection[] {
	return [
		{ heading: 'Docs', items: docsPages },
		{ heading: 'Components', items: getComponentItems() }
	];
}
