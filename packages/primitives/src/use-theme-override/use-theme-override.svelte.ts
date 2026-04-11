/** A map of CSS custom property names to values. */
export type ThemeTokenMap = Record<string, string>;

/**
 * Reactively apply CSS custom property overrides to document.documentElement.
 *
 * Tokens are set as inline styles on :root, which means they override the
 * static theme CSS and cascade to all elements — including `<dialog>` elements
 * in the browser's top layer.
 *
 * Only touches properties whose values actually changed, so a tick that
 * changes 2 out of 137 tokens results in 2 setProperty calls, not 137.
 *
 * Automatically cleans up (removes all set properties) when the calling
 * component is destroyed.
 *
 * @param getTokens - A function returning the current token map.
 *                    Called reactively; when the return value changes,
 *                    stale properties are removed and new ones applied.
 */
export function useThemeOverride(getTokens: () => ThemeTokenMap): void {
	if (typeof document === 'undefined') return;

	let previous: Record<string, string> = {};

	$effect(() => {
		const tokens = getTokens();
		const el = document.documentElement;

		// Set or update only changed properties
		for (const k in tokens) {
			if (previous[k] !== tokens[k]) {
				el.style.setProperty(k, tokens[k] ?? null);
			}
		}

		// Remove properties that were in previous but not in current
		for (const k in previous) {
			if (!(k in tokens)) {
				el.style.removeProperty(k);
			}
		}

		previous = { ...tokens };

		return () => {
			for (const k in previous) {
				el.style.removeProperty(k);
			}
			previous = {};
		};
	});
}
