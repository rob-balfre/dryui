import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import ComboboxHarness from './fixtures/combobox-harness.svelte';
import { render } from './_harness';

function getInput(): HTMLInputElement {
	const input = document.querySelector<HTMLInputElement>('[data-testid="combobox-input"]');
	if (!input) throw new Error('Expected combobox input');
	return input;
}

function getContent(): HTMLDivElement {
	const content = document.querySelector<HTMLDivElement>('[data-testid="combobox-content"]');
	if (!content) throw new Error('Expected combobox content');
	return content;
}

function getItem(value: string): HTMLElement {
	const item = document.querySelector<HTMLElement>(`[data-testid="item-${value}"]`);
	if (!item) throw new Error(`Expected combobox item ${value}`);
	return item;
}

describe('Combobox', () => {
	it('opens with canonical anchor-positioning styles when the input is focused', async () => {
		render(ComboboxHarness);

		const input = getInput();
		const content = getContent();

		input.focus();

		for (let i = 0; i < 30; i++) {
			flushSync();
			if (content.matches(':popover-open')) break;
			await new Promise((resolve) => setTimeout(resolve, 10));
		}

		expect(content.matches(':popover-open')).toBe(true);
		expect(document.querySelector('[data-testid="bound-open"]')?.textContent).toBe('true');
		expect(input.getAttribute('aria-expanded')).toBe('true');
		expect(input.style.getPropertyValue('anchor-name')).toContain('--dryui-anchor-');
		expect(content.style.position).toBe('fixed');
		expect(content.style.getPropertyValue('position-area')).toBe('block-end span-inline-end');
		expect(content.style.getPropertyValue('position-try-fallbacks')).toContain('flip-block');
		expect(content.style.justifySelf).toBe('start');
	});

	it('selects an item and updates the bound value', async () => {
		render(ComboboxHarness);

		const input = getInput();
		const content = getContent();

		input.focus();

		for (let i = 0; i < 30; i++) {
			flushSync();
			if (content.matches(':popover-open')) break;
			await new Promise((resolve) => setTimeout(resolve, 10));
		}

		getItem('react').click();
		await new Promise((resolve) => setTimeout(resolve, 10));
		flushSync();

		expect(document.querySelector('[data-testid="bound-value"]')?.textContent).toBe('react');
		expect(content.matches(':popover-open')).toBe(false);
		expect(input.value).toBe('React');
	});
});
