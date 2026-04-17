import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import TextareaHarness from './fixtures/textarea-harness.svelte';
import { render } from './_harness';

function getTextarea(testId: string): HTMLTextAreaElement {
	const el = document.querySelector(`textarea[data-testid="${testId}"]`);
	if (!(el instanceof HTMLTextAreaElement)) {
		throw new Error(`Expected <textarea> for ${testId}`);
	}
	return el;
}

describe('Textarea', () => {
	it('renders a <textarea> with data-size="md" by default', () => {
		render(TextareaHarness);
		const ta = getTextarea('default-textarea');

		expect(ta.getAttribute('data-size')).toBe('md');
		expect(ta.disabled).toBe(false);
	});

	it('propagates the size prop to data-size', () => {
		render(TextareaHarness);

		expect(getTextarea('sm-textarea').getAttribute('data-size')).toBe('sm');
		expect(getTextarea('lg-textarea').getAttribute('data-size')).toBe('lg');
	});

	it('reflects disabled prop via attribute and data-disabled', () => {
		render(TextareaHarness);
		const ta = getTextarea('disabled-textarea');

		expect(ta.disabled).toBe(true);
		expect(ta.getAttribute('data-disabled')).toBe('true');
	});

	it('binds value two-way on input', () => {
		render(TextareaHarness, { initialValue: 'start' });
		const ta = getTextarea('default-textarea');
		const bound = document.querySelector<HTMLElement>('[data-testid="bound-value"]');

		expect(ta.value).toBe('start');
		expect(bound?.textContent).toBe('start');

		ta.value = 'typed out';
		ta.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();

		expect(bound?.textContent).toBe('typed out');
	});

	it('inherits id + aria-invalid from Field context and associates a label', () => {
		render(TextareaHarness);
		const ta = getTextarea('field-textarea');
		const label = document.querySelector<HTMLLabelElement>('[data-testid="field-label"]');

		expect(ta.id).toBeTruthy();
		expect(label?.getAttribute('for')).toBe(ta.id);
		expect(ta.getAttribute('aria-invalid')).toBe('true');
		expect(ta.getAttribute('aria-errormessage')).toBeTruthy();
	});
});
