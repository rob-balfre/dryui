import type { ThemeTokens } from './derivation.js';

export interface GenerateCssOptions {
	personalityTokens?: Record<string, string>;
	shapeTokens?: Record<string, string>;
	shadowTokens?: { light: Record<string, string>; dark: Record<string, string> };
}

/**
 * Generate CSS files from a ThemeTokens object.
 *
 * Returns:
 *   defaultCss — `:root { ... }` block with all light tokens.
 *   darkCss    — `[data-theme="dark"] { ... }` block plus `.theme-auto` media query.
 */
export function generateCss(
	theme: ThemeTokens,
	options?: GenerateCssOptions
): { defaultCss: string; darkCss: string } {
	// Build default.css (:root block)
	const defaultLines: string[] = [':root {'];
	for (const [token, value] of Object.entries(theme.light)) {
		defaultLines.push(`  ${token}: ${value};`);
	}

	// Shadow tokens (light mode)
	if (options?.shadowTokens) {
		for (const [token, value] of Object.entries(options.shadowTokens.light)) {
			defaultLines.push(`  ${token}: ${value};`);
		}
	}

	// Shape tokens (mode-independent, go in :root)
	if (options?.shapeTokens) {
		for (const [token, value] of Object.entries(options.shapeTokens)) {
			defaultLines.push(`  ${token}: ${value};`);
		}
	}

	// Personality tokens (use semantic refs, mode-independent, go in :root)
	if (options?.personalityTokens) {
		for (const [token, value] of Object.entries(options.personalityTokens)) {
			defaultLines.push(`  ${token}: ${value};`);
		}
	}

	defaultLines.push('}');
	const defaultCss = defaultLines.join('\n');

	// Build dark.css ([data-theme="dark"] + .theme-auto media query)
	const darkEntries = Object.entries(theme.dark);
	const darkShadowEntries = options?.shadowTokens ? Object.entries(options.shadowTokens.dark) : [];

	const darkLines: string[] = ['[data-theme="dark"] {'];
	for (const [token, value] of darkEntries) {
		darkLines.push(`  ${token}: ${value};`);
	}
	for (const [token, value] of darkShadowEntries) {
		darkLines.push(`  ${token}: ${value};`);
	}
	darkLines.push('}');
	darkLines.push('');
	darkLines.push('.theme-auto {');
	darkLines.push('  @media (prefers-color-scheme: dark) {');
	darkLines.push('    & {');
	for (const [token, value] of darkEntries) {
		darkLines.push(`      ${token}: ${value};`);
	}
	for (const [token, value] of darkShadowEntries) {
		darkLines.push(`      ${token}: ${value};`);
	}
	darkLines.push('    }');
	darkLines.push('  }');
	darkLines.push('}');
	const darkCss = darkLines.join('\n');

	return { defaultCss, darkCss };
}

/**
 * Trigger a browser download of the combined CSS as a single file.
 */
export function downloadCss(
	theme: ThemeTokens,
	filename = 'dryui-theme.css',
	options?: GenerateCssOptions
): void {
	const { defaultCss, darkCss } = generateCss(theme, options);
	const combined = `${defaultCss}\n\n${darkCss}`;
	const blob = new Blob([combined], { type: 'text/css' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

/**
 * Copy the combined CSS to the clipboard.
 */
export async function copyCss(theme: ThemeTokens, options?: GenerateCssOptions): Promise<void> {
	const { defaultCss, darkCss } = generateCss(theme, options);
	const combined = `${defaultCss}\n\n${darkCss}`;
	await navigator.clipboard.writeText(combined);
}

/**
 * Return a JSON string containing the light and dark token maps.
 */
export function exportJson(theme: ThemeTokens): string {
	return JSON.stringify({ light: theme.light, dark: theme.dark }, null, 2);
}
