import { allComponentNames, toSlug } from '$lib/nav';

export function entries() {
	return allComponentNames().map((name) => ({ slug: toSlug(name) }));
}
