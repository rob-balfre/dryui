import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import CheckboxHarness from './fixtures/checkbox-harness.svelte';
import { render } from './_harness';

function getInput(testId: string): HTMLInputElement {
	const el = document.querySelector(`input[data-testid="${testId}"]`);
	if (!(el instanceof HTMLInputElement)) {
		throw new Error(`Expected <input> for ${testId}`);
	}
	return el;
}

describe('Checkbox', () => {
	it('renders a type="checkbox" input with data-state="unchecked" by default', () => {
		render(CheckboxHarness);
		const input = getInput('default-input');

		expect(input.type).toBe('checkbox');
		expect(input.getAttribute('data-state')).toBe('unchecked');
		expect(input.getAttribute('data-size')).toBe('md');
		expect(input.checked).toBe(false);
	});

	it('wraps input in a <label> when children snippet is provided', () => {
		render(CheckboxHarness);
		const input = getInput('with-label-input');
		const label = input.closest('label');

		expect(label).toBeInstanceOf(HTMLLabelElement);
		expect(label?.textContent?.trim()).toContain('Accept terms');
	});

	it('propagates size prop to data-size attribute', () => {
		render(CheckboxHarness);

		expect(getInput('sm-input').getAttribute('data-size')).toBe('sm');
		expect(getInput('lg-input').getAttribute('data-size')).toBe('lg');
	});

	it('updates data-state to "checked" on click and syncs bound value', () => {
		render(CheckboxHarness);
		const input = getInput('default-input');
		const bound = document.querySelector<HTMLElement>('[data-testid="bound-checked"]');

		expect(bound?.textContent).toBe('false');

		input.click();
		flushSync();

		expect(input.checked).toBe(true);
		expect(input.getAttribute('data-state')).toBe('checked');
		expect(bound?.textContent).toBe('true');
	});

	it('reflects disabled state via attribute and data-disabled', () => {
		render(CheckboxHarness);
		const input = getInput('disabled-input');

		expect(input.disabled).toBe(true);
		expect(input.getAttribute('data-disabled')).toBe('true');
	});

	it('sets data-state="indeterminate" and the input.indeterminate DOM property', () => {
		render(CheckboxHarness, { indeterminate: true });
		const input = getInput('indeterminate-input');

		expect(input.getAttribute('data-state')).toBe('indeterminate');
		expect(input.indeterminate).toBe(true);
	});
});
