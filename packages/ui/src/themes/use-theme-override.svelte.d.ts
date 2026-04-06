/** A map of CSS custom property names to values. */
export type ThemeTokenMap = Record<string, string>;
/**
 * Reactively apply CSS custom property overrides to document.documentElement.
 *
 * Tokens are set as inline styles on :root, which means they override the
 * static theme CSS and cascade to all elements — including `<dialog>` elements
 * in the browser's top layer.
 *
 * Automatically cleans up (removes all set properties) when the calling
 * component is destroyed.
 *
 * @param getTokens - A function returning the current token map.
 *                    Called reactively; when the return value changes,
 *                    stale properties are removed and new ones applied.
 */
export declare function useThemeOverride(getTokens: () => ThemeTokenMap): void;
