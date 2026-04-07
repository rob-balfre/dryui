import { afterEach, describe, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import ImageComparisonHarness from './fixtures/image-comparison-harness.svelte';

const mountedComponents: ReturnType<typeof mount>[] = [];

afterEach(() => {
	for (const component of mountedComponents.splice(0)) {
		unmount(component);
	}

	document.body.replaceChildren();
});

function renderImageComparisonHarness() {
	const target = document.createElement('div');
	document.body.append(target);

	const component = mount(ImageComparisonHarness, {
		target
	});

	mountedComponents.push(component);
	flushSync();
	return target;
}

describe('ImageComparison', () => {
	it('keeps comparison layers in layout inside a sized wrapper', () => {
		const target = renderImageComparisonHarness();
		const frame = target.querySelector('.frame');
		const root = target.querySelector('[data-image-comparison]');
		const before = target.querySelector('[data-part="before"]');
		const after = target.querySelector('[data-part="after"]');
		const slider = target.querySelector('[role="slider"]');

		if (!(frame instanceof HTMLElement)) {
			throw new Error('Expected wrapper frame');
		}

		if (!(root instanceof HTMLElement)) {
			throw new Error('Expected image comparison root');
		}

		if (!(before instanceof HTMLElement)) {
			throw new Error('Expected before layer');
		}

		if (!(after instanceof HTMLElement)) {
			throw new Error('Expected after layer');
		}

		expect(slider).toBeTruthy();

		const frameRect = frame.getBoundingClientRect();
		const rootRect = root.getBoundingClientRect();

		expect(frameRect.height).toBeGreaterThan(0);
		expect(rootRect.height).toBeGreaterThan(0);
		expect(before.getBoundingClientRect().height).toBeGreaterThan(0);
		expect(after.getBoundingClientRect().height).toBeGreaterThan(0);
		expect(Math.abs(frameRect.height - rootRect.height)).toBeLessThan(1);
	});
});
