import { afterEach, describe, expect, it } from 'vitest';
import docsAppHtml from '../../apps/docs/src/app.html?raw';

function extractInlineScript(html: string): string {
	const match = html.match(/<script>([\s\S]*?)<\/script>/);

	if (!match?.[1]) {
		throw new Error('Expected an inline bootstrap script');
	}

	return match[1];
}

function runBootstrap(script: string) {
	const execute = new Function(script);
	execute();
}

function resetThemeRoot() {
	document.documentElement.className = '';
	delete document.documentElement.dataset.theme;
}

afterEach(() => {
	localStorage.clear();
	resetThemeRoot();
});

describe('theme bootstrap', () => {
	it('applies the stored docs theme and falls back to system mode for invalid values', () => {
		const script = extractInlineScript(docsAppHtml);

		localStorage.setItem('dryui-docs-theme', 'dark');
		runBootstrap(script);

		expect(document.documentElement.dataset.theme).toBe('dark');
		expect(document.documentElement.classList.contains('theme-auto')).toBe(false);

		resetThemeRoot();
		localStorage.setItem('dryui-docs-theme', 'system');
		runBootstrap(script);

		expect(localStorage.getItem('dryui-docs-theme')).toBeNull();
		expect(document.documentElement.dataset.theme).toBeUndefined();
		expect(document.documentElement.classList.contains('theme-auto')).toBe(true);
	});
});
