import { expect, test } from 'vitest';
import { page } from 'vitest/browser';
import VisualBenchmarkScene from '../../apps/docs/src/lib/benchmarks/VisualBenchmarkScene.svelte';
import '../../apps/docs/src/app.css';
import { render } from './_harness';

function renderScene() {
	render(VisualBenchmarkScene);
	const root = page.getByTestId('visual-benchmark-root');
	return { root };
}

test('visual benchmark scene stays stable', async () => {
	const { root } = renderScene();

	await expect(root).toMatchScreenshot('visual-benchmark-scene', {
		screenshotOptions: {
			animations: 'disabled'
		}
	});
});
