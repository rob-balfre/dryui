import { createThemeController, type ThemeController } from '@dryui/ui';

const STORAGE_KEY = 'dryui-docs-theme';

/**
 * Shared docs theme controller. Persists explicit picks under `dryui-docs-theme`
 * and tracks `prefers-color-scheme` for system mode.
 */
export const docsTheme: ThemeController = createThemeController({ storageKey: STORAGE_KEY });

/**
 * Reactive helper that returns `true` when the current rendered theme is dark.
 * Callers wrapping this in `$derived` will re-run when either the stored mode
 * or the system preference changes.
 */
export function isDarkTheme(): boolean {
	return docsTheme.isDark;
}
