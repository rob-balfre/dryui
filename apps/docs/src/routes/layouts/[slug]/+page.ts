import { error } from '@sveltejs/kit';
import { layoutPresets } from '$lib/nav';
import type { PageLoad } from './$types';

export const prerender = layoutPresets.length > 0;

export const load: PageLoad = ({ params }) => {
	const preset = layoutPresets.find((p) => p.id === params.slug);
	if (!preset) throw error(404, `Layout "${params.slug}" not found`);
	return { preset };
};

export function entries() {
	return layoutPresets.map((p) => ({ slug: p.id }));
}
