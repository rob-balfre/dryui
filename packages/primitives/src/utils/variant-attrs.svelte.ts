/**
 * Build a record of `data-*` attributes from a variant/size/color-style input,
 * suitable for spreading onto a DOM element.
 *
 * - Keys whose value is `undefined` are omitted entirely (so CSS selectors like
 *   `[data-variant='solid']` only match when the variant is actually set).
 * - Keys that already start with `data-` are passed through verbatim.
 * - Any other key is prefixed with `data-`.
 * - Values are coerced with `String(value)`.
 *
 * Use as:
 *   <button {...variantAttrs({ variant, size, color })}>…</button>
 *
 * The helper is plain JS with no reactive state of its own — when called
 * inside Svelte 5's template, the `{...}` spread is re-evaluated whenever
 * the input props change and attributes are added/removed accordingly.
 */
export function variantAttrs(
	input: Record<string, string | number | boolean | null | undefined>
): Record<string, string> {
	const out: Record<string, string> = {};
	for (const key in input) {
		const value = input[key];
		if (value === undefined || value === null) continue;
		const attr = key.startsWith('data-') ? key : `data-${key}`;
		out[attr] = String(value);
	}
	return out;
}
