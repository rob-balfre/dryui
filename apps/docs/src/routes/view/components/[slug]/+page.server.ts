import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import componentPages from '$lib/generated/component-pages.json';
import type {
	DocsComponentPageEntry,
	DocsComponentPagesManifest
} from '../../../../../../../packages/mcp/src/docs-component-pages.js';

const componentPageManifest = componentPages as DocsComponentPagesManifest;
const components = componentPageManifest.components;
const componentsBySlug = new Map<string, DocsComponentPageEntry>(
	Object.values(components).map((entry) => [entry.slug, entry])
);

type PreviewComponentPageData = Pick<
	DocsComponentPageEntry,
	'name' | 'description' | 'category' | 'sourcePackage'
>;

export const load: PageServerLoad = async ({ params }) => {
	const entry = componentsBySlug.get(params.slug);
	if (!entry) {
		throw error(404, `Component "${params.slug}" not found`);
	}

	return {
		name: entry.name,
		description: entry.description,
		category: entry.category,
		sourcePackage: entry.sourcePackage
	} satisfies PreviewComponentPageData;
};
