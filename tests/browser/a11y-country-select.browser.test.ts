import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import CountrySelectHarness from './fixtures/country-select-a11y-harness.svelte';
import { render } from './_harness';

type Variant = 'ui' | 'primitive';

function renderHarness(variant: Variant, initialValue = 'US') {
	render(CountrySelectHarness, { variant, initialValue });

	const combobox = document.querySelector<HTMLInputElement>('input[role="combobox"]');
	if (!combobox) {
		throw new Error(`Expected ${variant} country select combobox`);
	}

	return combobox;
}

function press(key: string) {
	const active = document.activeElement;
	if (!(active instanceof HTMLElement)) {
		throw new Error(`Expected active element before pressing ${key}`);
	}

	active.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
	flushSync();
}

function type(input: HTMLInputElement, value: string) {
	input.value = value;
	input.dispatchEvent(new Event('input', { bubbles: true }));
	flushSync();
}

describe.each<Variant>(['ui', 'primitive'])('CountrySelect accessibility (%s)', (variant) => {
	it('uses a single combobox field with a controlled listbox popup', () => {
		const input = renderHarness(variant);

		expect(document.querySelectorAll('input[type="text"]')).toHaveLength(1);
		expect(document.querySelector('[data-part="trigger"]')).toBeNull();
		expect(input.getAttribute('aria-expanded')).toBe('false');

		input.focus();
		flushSync();

		const listbox = document.querySelector<HTMLElement>('[role="listbox"]');
		expect(listbox).not.toBeNull();
		expect(input.getAttribute('aria-expanded')).toBe('true');
		expect(input.getAttribute('aria-controls')).toBe(listbox?.id);
		expect(listbox?.getAttribute('aria-labelledby')).toBe(input.id);
		expect(document.querySelector('[role="option"]')).not.toBeNull();
	});

	it('applies canonical anchor-positioning styles and sizing to the popup', () => {
		const input = renderHarness(variant);

		input.focus();
		flushSync();

		const listbox = document.querySelector<HTMLElement>('[role="listbox"]');
		expect(listbox).not.toBeNull();
		expect(listbox?.getAttribute('popover')).toBe('manual');
		expect(input.getAttribute('style')).toContain('anchor-name: --dryui-anchor-');
		expect(listbox?.style.position).toBe('fixed');
		expect(listbox?.getAttribute('style')).toContain('position-anchor: --dryui-anchor-');
		expect(listbox?.style.getPropertyValue('position-area')).toBe('block-end span-inline-end');
		expect(listbox?.style.positionTryFallbacks).toContain('flip-block');
		expect(listbox!.getBoundingClientRect().width).toBeGreaterThanOrEqual(
			input.getBoundingClientRect().width - 1
		);
	});

	it('filters with the combobox input and commits the active option with Enter', () => {
		const input = renderHarness(variant, '');

		input.focus();
		flushSync();

		type(input, 'Aus');

		const activeId = input.getAttribute('aria-activedescendant');
		expect(activeId).toBeTruthy();
		expect(document.getElementById(activeId!)?.textContent).toContain('Australia');

		press('Enter');

		const hiddenValue = document.querySelector<HTMLInputElement>(
			'input[type="hidden"][name="country"]'
		);
		expect(hiddenValue?.value).toBe('AU');
		expect(document.querySelector('[data-testid="bound-value"]')?.textContent).toBe('AU');
		expect(input.value).toBe('Australia');
		expect(input.getAttribute('aria-expanded')).toBe('false');
		expect(document.querySelector('[role="listbox"]')?.getAttribute('data-state')).toBe('closed');
		expect(document.body.textContent).toContain('+61');
	});

	it('restores the selected country label when Escape closes an in-progress query', () => {
		const input = renderHarness(variant, 'US');

		input.focus();
		flushSync();

		type(input, 'zzz');

		expect(document.body.textContent).toContain('No countries found.');

		press('Escape');

		expect(input.getAttribute('aria-expanded')).toBe('false');
		expect(input.value).toBe('United States');
		expect(document.querySelector('[data-testid="bound-value"]')?.textContent).toBe('US');
		expect(document.querySelector('[role="listbox"]')?.getAttribute('data-state')).toBe('closed');
	});
});
