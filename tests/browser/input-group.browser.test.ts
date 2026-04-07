import { afterEach, describe, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import InputGroupHarness from './fixtures/input-group-harness.svelte';

const mountedComponents: ReturnType<typeof mount>[] = [];

afterEach(() => {
	for (const component of mountedComponents.splice(0)) {
		unmount(component);
	}

	document.body.replaceChildren();
});

describe('input group', () => {
	it('expands the input track to fill the available grid space', () => {
		const target = document.createElement('div');
		target.style.width = '40rem';
		document.body.append(target);

		const component = mount(InputGroupHarness, {
			target
		});

		mountedComponents.push(component);
		flushSync();

		const root = target.querySelector<HTMLElement>('[data-input-group-root]');
		const inputWrap = target.querySelector<HTMLElement>('[data-input-group-inputWrap]');

		expect(root).toBeTruthy();
		expect(inputWrap).toBeTruthy();

		const rootWidth = root!.getBoundingClientRect().width;
		const inputWidth = inputWrap!.getBoundingClientRect().width;

		expect(rootWidth).toBeGreaterThan(500);
		expect(inputWidth).toBeGreaterThan(rootWidth * 0.45);
	});
});
