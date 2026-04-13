import { describe, expect, it } from 'vitest';
import InputGroupHarness from './fixtures/input-group-harness.svelte';
import { createBodyTarget, render } from './_harness';

describe('input group', () => {
	it('expands the input track to fill the available grid space', () => {
		const target = createBodyTarget();
		target.style.width = '40rem';

		render(InputGroupHarness, {}, { target });

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
