import { DOCS_ROUTES } from '../../../../packages/mcp/src/docs-surface.js';
import { categories, toSlug } from '$lib/nav';

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
const routeModules = {
	...import.meta.glob('/src/routes/**/+page.svelte'),
	...import.meta.glob('/apps/docs/src/routes/**/+page.svelte')
};
const validRoutes = new Set(
	Object.keys(routeModules).map(
		(p) => p.replace(/^\/(?:apps\/docs\/)?src\/routes/, '').replace('/+page.svelte', '') || '/'
	)
);

const docsPages = DOCS_ROUTES.filter((route) => validRoutes.has(route.path)).map((route) => ({
	label: route.label,
	href: route.path,
	description: `${route.description}.`,
	keywords: [...(route.keywords ?? [])]
}));

function getComponentItems(): SearchItem[] {
	return categories.flatMap((category) =>
		category.items.map((item) => {
			const keywords = [
				category.label.toLowerCase(),
				'component',
				item.kind,
				item.name.toLowerCase(),
				toSlug(item.name)
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
