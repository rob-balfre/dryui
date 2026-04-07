import { afterEach, describe, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import FieldHarness from './fixtures/field-harness.svelte';

const mountedComponents: ReturnType<typeof mount>[] = [];

afterEach(() => {
	for (const component of mountedComponents.splice(0)) {
		unmount(component);
	}

	document.documentElement.dataset.theme = '';
	document.documentElement.classList.remove('theme-auto');
	document.body.replaceChildren();
});

function renderField() {
	document.documentElement.dataset.theme = 'dark';

	const target = document.createElement('div');
	document.body.append(target);

	const component = mount(FieldHarness, {
		target
	});

	mountedComponents.push(component);
	flushSync();
	return target;
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
