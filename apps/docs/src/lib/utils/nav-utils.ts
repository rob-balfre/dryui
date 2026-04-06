/**
 * Creates a slug-based finder for a navigation entry array.
 *
 * @param entries - The array to search.
 * @param matches - Predicate that checks whether an entry matches a given slug.
 * @returns A function that accepts a slug and returns the first matching entry (or undefined).
 */
export function createNavFinder<T>(
	entries: T[],
	matches: (entry: T, slug: string) => boolean
): (slug: string) => T | undefined {
	return (slug) => entries.find((entry) => matches(entry, slug));
}
