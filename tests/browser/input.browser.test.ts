import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import InputHarness from './fixtures/input-harness.svelte';
import { render } from './_harness';

function getInput(testId: string): HTMLInputElement {
	const el = document.querySelector(`input[data-testid="${testId}"]`);
	if (!(el instanceof HTMLInputElement)) {
		throw new Error(`Expected <input> for ${testId}`);
	}
	return el;
}

describe('Input', () => {
	it('mounts an <input> with default data-size="md" and no variant attr', () => {
		render(InputHarness);
		const input = getInput('default-input');

		expect(input.getAttribute('data-size')).toBe('md');
		expect(input.getAttribute('data-variant')).toBeNull();
		expect(input.disabled).toBe(false);
	});

	it('propagates size prop to data-size', () => {
		render(InputHarness);

		expect(getInput('sm-input').getAttribute('data-size')).toBe('sm');
		expect(getInput('lg-input').getAttribute('data-size')).toBe('lg');
	});

	it('applies ghost variant as data-variant attribute', () => {
		render(InputHarness);
		const input = getInput('ghost-input');

		expect(input.getAttribute('data-variant')).toBe('ghost');
	});

	it('reflects disabled prop as HTML attribute and data-disabled', () => {
		render(InputHarness);
		const input = getInput('disabled-input');

		expect(input.disabled).toBe(true);
		expect(input.getAttribute('data-disabled')).toBe('true');
	});

	it('passes placeholder through rest spread', () => {
		render(InputHarness);
		const input = getInput('placeholder-input');

		expect(input.placeholder).toBe('Search...');
	});

	it('binds value two-way when user types', () => {
		render(InputHarness, { initialValue: 'initial' });
		const input = getInput('default-input');
		const boundValue = document.querySelector<HTMLElement>('[data-testid="bound-value"]');

		expect(input.value).toBe('initial');
		expect(boundValue?.textContent).toBe('initial');

		input.value = 'typed';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();

		expect(boundValue?.textContent).toBe('typed');
	});

	it('wires id, aria-invalid, and aria-errormessage from Field context', () => {
		render(InputHarness);
		const input = getInput('field-input');
		const label = document.querySelector<HTMLLabelElement>('[data-testid="field-label"]');

		expect(input.id).toBeTruthy();
		expect(label?.getAttribute('for')).toBe(input.id);
		expect(input.getAttribute('aria-invalid')).toBe('true');
		// errormessage id should be set when Field has an error
		expect(input.getAttribute('aria-errormessage')).toBeTruthy();
	});
});
