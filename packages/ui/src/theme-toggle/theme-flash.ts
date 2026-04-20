/**
 * Build an IIFE string that synchronously applies the stored theme preference
 * to `<html>` before the first paint. Embed the result inside a `<script>` tag
 * in the document head, above any stylesheet imports, to prevent a flash of
 * the wrong theme when a user has explicitly chosen light or dark.
 *
 * Usage:
 * ```html
 * <script>{@html themeFlashScript('dryui-theme')}</script>
 * ```
 *
 * The script reads the given storage key, sets `html.classList.theme-auto`
 * when no explicit preference is stored, and sets `html.dataset.theme` to
 * `'light'` or `'dark'` otherwise. Invalid stored values are removed.
 */
export function themeFlashScript(storageKey: string = 'dryui-theme'): string {
	// Escape the storage key so it's safe to embed between JSON-style quotes.
	const key = JSON.stringify(storageKey);

	return `(() => {
  const root = document.documentElement;
  try {
    const stored = window.localStorage.getItem(${key});
    const explicit = stored === 'light' || stored === 'dark' ? stored : null;
    if (!explicit && stored !== null) {
      window.localStorage.removeItem(${key});
    }
    root.classList.toggle('theme-auto', explicit === null);
    if (explicit) {
      root.dataset.theme = explicit;
    } else {
      delete root.dataset.theme;
    }
  } catch {
    delete root.dataset.theme;
    root.classList.add('theme-auto');
  }
})();`;
}
