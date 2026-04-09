import { categories, toSlug } from '$lib/nav';
export interface SearchItem {
	label: string;
	href: string;
	description: string;
	keywords: string[];
}

export interface SearchSection {
	heading: string;
	items: SearchItem[];
}

// Build-time route discovery — Vite resolves this at compile time so stale
// entries pointing to deleted routes are automatically filtered out.
const routeModules = import.meta.glob('/src/routes/**/+page.svelte');
const validRoutes = new Set(
	Object.keys(routeModules).map((p) => p.replace('/src/routes', '').replace('/+page.svelte', '') || '/')
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
		label: 'Components',
		href: '/components',
		description: 'Browse every published DryUI component.',
		keywords: ['component index', 'catalog']
	},
	{
		label: 'Theme Wizard',
		href: '/theme-wizard',
		description: 'Build and export DryUI semantic token themes.',
		keywords: ['tokens', 'palette', 'theme editor']
	},
	{
		label: 'Tools',
		href: '/tools',
		description: 'CLI commands and MCP server setup for DryUI tooling.',
		keywords: ['cli', 'mcp', 'commands', 'tooling', 'terminal', 'model context protocol', 'review', 'diagnose', 'compose']
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
		category.items.map((item) => ({
			label: item.name,
			href: `/components/${toSlug(item.name)}`,
			description: `${category.label} component`,
			keywords: [category.label.toLowerCase(), 'component', item.kind]
		}))
	);
}

export function getSearchSections(): SearchSection[] {
	return [
		{ heading: 'Docs', items: docsPages },
		{ heading: 'Components', items: getComponentItems() }
	];
}
