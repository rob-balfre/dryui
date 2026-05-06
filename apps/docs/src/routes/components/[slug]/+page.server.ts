import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { PublicComponentPageData } from '$lib/component-page-manifest';
import { getComponentPageEntry, toPublicComponentPageData } from '$lib/component-page-manifest';

export const load: PageServerLoad = async ({ params }) => {
	const entry = getComponentPageEntry(params.slug);
	if (!entry) {
		throw error(404, `Component "${params.slug}" not found`);
	}

	return toPublicComponentPageData(entry) satisfies PublicComponentPageData;
};
