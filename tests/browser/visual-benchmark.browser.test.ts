import { afterEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import VisualBenchmarkScene from '../../apps/docs/src/lib/benchmarks/VisualBenchmarkScene.svelte';
import {
	applyVisualBenchmarkTheme,
	restoreVisualBenchmarkTheme
} from '../../apps/docs/src/lib/benchmarks/theme';
import '../../apps/docs/src/app.css';
import { render } from './_harness';

afterEach(() => {
	document.documentElement.className = '';
	document.documentElement.removeAttribute('data-theme');
	document.documentElement.removeAttribute('data-dryui-benchmark-previous-class');
	document.documentElement.removeAttribute('data-dryui-benchmark-previous-theme');
	document.documentElement.removeAttribute('data-dryui-benchmark-had-theme');
});

function renderScene() {
	document.documentElement.classList.remove('theme-auto', 'theme-dark', 'theme-light');
	document.documentElement.classList.add('theme-light');
	render(VisualBenchmarkScene);
	const root = page.getByTestId('visual-benchmark-root');
	return { root };
}

test('visual benchmark theme helper forces light tokens and restores the previous root theme', () => {
	document.documentElement.className = 'theme-auto docs-shell-test';
	document.documentElement.setAttribute('data-theme', 'dark');

	applyVisualBenchmarkTheme();

	expect(document.documentElement.classList.contains('theme-light')).toBe(true);
	expect(document.documentElement.classList.contains('theme-auto')).toBe(false);
	expect(document.documentElement.dataset.theme).toBe('light');

	restoreVisualBenchmarkTheme();

	expect(document.documentElement.className).toBe('theme-auto docs-shell-test');
	expect(document.documentElement.dataset.theme).toBe('dark');
});

test('visual benchmark scene stays stable', async () => {
	const { root } = renderScene();

	await expect(root).toMatchScreenshot('visual-benchmark-scene', {
		screenshotOptions: {
			animations: 'disabled'
		}
	});
});
