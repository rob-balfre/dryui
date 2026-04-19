/**
 * Join a list of id-like strings into a single space-separated string suitable
 * for `aria-describedby`, `aria-labelledby`, etc. Falsy values are dropped.
 * Returns `undefined` when every id is falsy, so the attribute is omitted.
 */
export function mergeIds(...ids: Array<string | null | undefined>): string | undefined {
	const merged = ids.filter(Boolean).join(' ');
	return merged.length > 0 ? merged : undefined;
}
