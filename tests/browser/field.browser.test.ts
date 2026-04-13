import { afterEach, describe, expect, it } from 'vitest';
import FieldHarness from './fixtures/field-harness.svelte';
import { render } from './_harness';

afterEach(() => {
	document.documentElement.dataset.theme = '';
	document.documentElement.classList.remove('theme-auto');
});

function renderField() {
	document.documentElement.dataset.theme = 'dark';
	return render(FieldHarness).target;
}

describe('Field', () => {
	it('keeps labels in source order ahead of inputs', () => {
		const target = renderField();
		const label = target.querySelector<HTMLElement>('[data-testid="field-label"]');
		const input = target.querySelector<HTMLInputElement>('[data-testid="field-input"]');

		if (!label || !input) {
			throw new Error('Expected field label and input');
		}

		expect(getComputedStyle(label).order).toBe('0');
		expect(getComputedStyle(input).order).toBe('0');
		expect(label.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
	});
});
