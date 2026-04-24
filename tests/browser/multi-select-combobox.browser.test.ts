import { afterEach, describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import MultiSelectComboboxHarness from './fixtures/multi-select-combobox-harness.svelte';
import { render } from './_harness';

afterEach(() => {
	document.documentElement.dataset.theme = '';
	document.documentElement.classList.remove('theme-auto');
});

function renderHarness(props?: { maxSelections?: number; name?: string }) {
	document.documentElement.dataset.theme = 'dark';

	render(MultiSelectComboboxHarness, props);

	const input = document.querySelector<HTMLInputElement>('input[role="combobox"]');
	if (!input) {
		throw new Error('Expected combobox input');
	}

	return input;
}

function getContent() {
	const content = document.querySelector<HTMLDivElement>('[data-testid="multi-select-content"]');
	if (!content) {
		throw new Error('Expected multi-select content');
	}

	return content;
}

function getRoot() {
	const root = document.querySelector<HTMLElement>('[data-multi-select-root]');
	if (!root) {
		throw new Error('Expected multi-select root');
	}

	return root;
}

function fireInput(input: HTMLInputElement, value: string) {
	input.value = value;
	input.dispatchEvent(new Event('input', { bubbles: true }));
	flushSync();
}

function fireKey(input: HTMLInputElement, key: string) {
	input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
	flushSync();
}

function clickOption(text: string) {
	const item = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find(
		(option) => option.textContent?.trim() === text
	);

	if (!item) {
		throw new Error(`Missing option: ${text}`);
	}

	item.click();
	flushSync();
	return item;
}

function clickRemoveButton(label: string) {
	const button = document.querySelector<HTMLButtonElement>(
		`button[aria-label="Remove selection: ${label}"]`
	);

	if (!button) {
		throw new Error(`Missing remove button for: ${label}`);
	}

	button.click();
	flushSync();
}

function getHiddenValues(name = 'assignees') {
	return Array.from(
		document.querySelectorAll<HTMLInputElement>(`input[type="hidden"][name="${name}"]`)
	).map((input) => input.value);
}

describe('MultiSelectCombobox', () => {
	it('opens with canonical anchor-positioning styles when the input is focused', () => {
		const input = renderHarness();
		const content = getContent();
		const root = getRoot();

		input.focus();
		flushSync();

		expect(input.getAttribute('aria-expanded')).toBe('true');
		expect(root.style.getPropertyValue('anchor-name')).toContain('--dryui-anchor-');
		expect(content.style.position).toBe('fixed');
		expect(content.style.getPropertyValue('position-area')).toBe('block-end span-inline-end');
		expect(content.style.getPropertyValue('position-try-fallbacks')).toContain('flip-block');
		expect(content.style.justifySelf).toBe('start');
	});

	it('selects multiple values with keyboard and renders hidden inputs', () => {
		const input = renderHarness();

		input.focus();
		fireKey(input, 'ArrowDown');
		fireKey(input, 'Enter');
		fireKey(input, 'ArrowDown');
		fireKey(input, 'ArrowDown');
		fireKey(input, 'Enter');

		expect(getHiddenValues()).toEqual(['maya', 'jordan']);
		expect(document.querySelector('[data-testid="value"]')?.textContent).toBe('maya,jordan');
		expect(document.querySelectorAll('input[type="hidden"][name="assignees"]')).toHaveLength(2);
	});

	it('deselects a selected option from the dropdown and removes the last selection with Backspace', () => {
		const input = renderHarness();

		clickOption('Maya Chen');

		expect(getHiddenValues()).toEqual(['maya']);

		clickOption('Maya Chen');

		expect(getHiddenValues()).toEqual([]);

		clickOption('Maya Chen');

		fireKey(input, 'Backspace');

		expect(getHiddenValues()).toEqual([]);
		expect(document.querySelector('[data-testid="value"]')?.textContent).toBe('');
	});

	it('removes a selected value when the token remove button is clicked', () => {
		renderHarness();

		clickOption('Maya Chen');
		clickOption('Jordan Lee');

		clickRemoveButton('Maya Chen');

		expect(getHiddenValues()).toEqual(['jordan']);
		expect(document.querySelector('[data-testid="value"]')?.textContent).toBe('jordan');
	});

	it('enforces maxSelections and disables additional options', () => {
		const input = renderHarness({ maxSelections: 2 });

		clickOption('Maya Chen');
		clickOption('Jordan Lee');

		fireInput(input, 'Priya');

		const priya = clickOption('Priya Patel');
		expect(priya.getAttribute('aria-disabled')).toBe('true');
		expect(getHiddenValues()).toEqual(['maya', 'jordan']);
	});

	it('skips disabled items while tracking the active option across groups', () => {
		const input = renderHarness();

		input.focus();
		fireKey(input, 'ArrowDown');

		let activeId = input.getAttribute('aria-activedescendant');
		expect(activeId).toBeTruthy();
		expect(document.getElementById(activeId!)?.textContent?.trim()).toBe('Maya Chen');

		fireKey(input, 'ArrowDown');

		activeId = input.getAttribute('aria-activedescendant');
		expect(activeId).toBeTruthy();
		expect(document.getElementById(activeId!)?.textContent?.trim()).toBe('Jordan Lee');
	});

	it('dismisses the popover on outside click and exposes empty state for filtered results', () => {
		const input = renderHarness();

		input.focus();
		flushSync();

		expect(input.getAttribute('aria-expanded')).toBe('true');

		fireInput(input, 'zzz');

		expect(document.querySelector('[role="option"]')).toBeNull();
		expect(document.body.textContent).toContain('No matches found.');

		document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		flushSync();

		expect(input.getAttribute('aria-expanded')).toBe('false');
	});
});
