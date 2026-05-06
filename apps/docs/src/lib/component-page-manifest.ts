import componentPages from '$lib/generated/component-pages.json';
import type {
	DocsComponentPageEntry,
	DocsComponentPagesManifest
} from '../../../../packages/mcp/src/docs-component-pages.js';

export type ComponentPageGroup = { name: string; props: string[] };

export type PublicComponentPageData = Omit<
	DocsComponentPageEntry,
	'slug' | 'category' | 'sourcePackage' | 'groups'
> & {
	groups: ComponentPageGroup[] | null;
};

export type PreviewComponentPageData = Pick<
	DocsComponentPageEntry,
	'name' | 'description' | 'category' | 'sourcePackage'
>;

export const componentPageManifest = componentPages as DocsComponentPagesManifest;

export const routeableComponentPageEntries = Object.values(componentPageManifest.components);

export const componentPagesBySlug = new Map<string, DocsComponentPageEntry>(
	routeableComponentPageEntries.map((entry) => [entry.slug, entry])
);

export function getComponentPageEntry(slug: string): DocsComponentPageEntry | undefined {
	return componentPagesBySlug.get(slug);
}

export function toPublicComponentPageData(entry: DocsComponentPageEntry): PublicComponentPageData {
	return {
		name: entry.name,
		description: entry.description,
		compound: entry.compound,
		props: entry.props,
		parts: entry.parts,
		forwardedProps: entry.forwardedProps,
		groups: entry.groups?.map((group) => ({ name: group.name, props: [...group.props] })) ?? null,
		a11y: entry.a11y,
		cssVars: entry.cssVars,
		dataAttributes: entry.dataAttributes,
		rootImport: entry.rootImport,
		subpathImport: entry.subpathImport,
		quickStartCode: entry.quickStartCode
	};
}

export function toPreviewComponentPageData(
	entry: DocsComponentPageEntry
): PreviewComponentPageData {
	return {
		name: entry.name,
		description: entry.description,
		category: entry.category,
		sourcePackage: entry.sourcePackage
	};
}

export function getComponentPagePrerenderEntries(): Array<{ slug: string }> {
	return routeableComponentPageEntries.map((entry) => ({ slug: entry.slug }));
}
