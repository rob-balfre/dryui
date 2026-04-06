import { afterEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { flushSync, mount, unmount } from 'svelte';
import VisualBenchmarkScene from '../../apps/docs/src/lib/benchmarks/VisualBenchmarkScene.svelte';
import '../../apps/docs/src/app.css';

const mountedScenes: ReturnType<typeof mount>[] = [];

afterEach(() => {
	for (const scene of mountedScenes.splice(0)) {
		unmount(scene);
	}

	document.body.replaceChildren();
});

function renderScene() {
	const host = document.createElement('div');
	document.body.append(host);

	const scene = mount(VisualBenchmarkScene, {
		target: host
	});

	mountedScenes.push(scene);
	flushSync();

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
