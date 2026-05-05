import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import componentPages from '$lib/generated/component-pages.json';
import type {
	DocsComponentPageEntry,
	DocsComponentPagesManifest
} from '../../../../../../packages/mcp/src/docs-component-pages.js';

const componentPageManifest = componentPages as DocsComponentPagesManifest;
const components = componentPageManifest.components;
const componentsBySlug = new Map<string, DocsComponentPageEntry>(
	Object.values(components).map((entry) => [entry.slug, entry])
);

type ComponentPageData = Omit<DocsComponentPageEntry, 'slug'>;

export const load: PageServerLoad = async ({ params }) => {
	const entry = componentsBySlug.get(params.slug);
	if (!entry) {
		throw error(404, `Component "${params.slug}" not found`);
	}

	return {
		name: entry.name,
		description: entry.description,
		compound: entry.compound,
		props: entry.props,
		parts: entry.parts,
		forwardedProps: entry.forwardedProps,
		groups: entry.groups,
		a11y: entry.a11y,
		cssVars: entry.cssVars,
		dataAttributes: entry.dataAttributes,
		rootImport: entry.rootImport,
		subpathImport: entry.subpathImport,
		quickStartCode: entry.quickStartCode
	} satisfies ComponentPageData;
};
