import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import RadioGroupHarness from './fixtures/radio-group-harness.svelte';
import { render } from './_harness';

function getRoot(): HTMLElement {
	const el = document.querySelector<HTMLElement>('[data-testid="radio-root"]');
	if (!el) throw new Error('Expected radio root');
	return el;
}

function getInput(value: string): HTMLInputElement {
	// RadioGroup.Item forwards `...rest` (including data-testid) to the input.
	const el = document.querySelector<HTMLElement>(`input[data-testid="item-${value}"]`);
	if (!(el instanceof HTMLInputElement)) throw new Error(`Expected radio input for ${value}`);
	return el;
}

describe('RadioGroup', () => {
	it('renders a div with role=radiogroup and aria-orientation', () => {
		render(RadioGroupHarness);

		const root = getRoot();
		expect(root.getAttribute('role')).toBe('radiogroup');
		expect(root.getAttribute('aria-orientation')).toBe('vertical');
		expect(root.getAttribute('data-orientation')).toBe('vertical');
	});

	it('propagates the orientation prop', () => {
		render(RadioGroupHarness, { orientation: 'horizontal' });

		const root = getRoot();
		expect(root.getAttribute('aria-orientation')).toBe('horizontal');
		expect(root.getAttribute('data-orientation')).toBe('horizontal');
	});

	it('renders each item as input[type=radio] sharing a name', () => {
		render(RadioGroupHarness);

		const free = getInput('free');
		const pro = getInput('pro');

		expect(free.type).toBe('radio');
		expect(pro.type).toBe('radio');
		expect(free.name).toBe('plan');
		expect(free.name).toBe(pro.name);
		expect(free.value).toBe('free');
		expect(pro.value).toBe('pro');
	});

	it('reflects the selected value across all inputs (only one is checked)', () => {
		render(RadioGroupHarness, { initialValue: 'pro' });

		expect(getInput('free').checked).toBe(false);
		expect(getInput('pro').checked).toBe(true);
		expect(getInput('enterprise').checked).toBe(false);
	});

	it('updates bound value when a radio is clicked (change event)', () => {
		render(RadioGroupHarness);

		const pro = getInput('pro');
		pro.click();
		flushSync();

		const boundValue = document.querySelector<HTMLElement>('[data-testid="bound-value"]');
		expect(boundValue?.textContent).toBe('pro');
		expect(getInput('pro').checked).toBe(true);
		expect(getInput('free').checked).toBe(false);
	});

	it('disables individual items via the disabled prop', () => {
		render(RadioGroupHarness);

		const enterprise = getInput('enterprise');
		expect(enterprise.disabled).toBe(true);
	});

	it('disables all inputs when the root is disabled', () => {
		render(RadioGroupHarness, { disabled: true });

		const root = getRoot();
		expect(root.getAttribute('data-disabled')).toBe('true');
		expect(getInput('free').disabled).toBe(true);
		expect(getInput('pro').disabled).toBe(true);
	});
});
