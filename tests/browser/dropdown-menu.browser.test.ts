import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import DropdownMenuHarness from './fixtures/dropdown-menu-harness.svelte';
import { render } from './_harness';

function getTrigger(): HTMLButtonElement {
	const trigger = document.querySelector<HTMLButtonElement>(
		'[data-testid="dropdown-menu-trigger"]'
	);
	if (!(trigger instanceof HTMLButtonElement)) throw new Error('Expected dropdown menu trigger');
	return trigger;
}

function getContent(): HTMLDivElement {
	const content = document.querySelector<HTMLDivElement>('[data-testid="dropdown-menu-content"]');
	if (!(content instanceof HTMLDivElement)) throw new Error('Expected dropdown menu content');
	return content;
}

function getItem(testId: string): HTMLDivElement {
	const item = document.querySelector<HTMLDivElement>(`[data-testid="${testId}"]`);
	if (!(item instanceof HTMLDivElement)) throw new Error(`Expected dropdown item ${testId}`);
	return item;
}

async function waitForMenuState(expectedOpen: boolean) {
	const content = getContent();
	const openState = document.querySelector<HTMLElement>('[data-testid="dropdown-menu-open"]');

	for (let i = 0; i < 30; i += 1) {
		flushSync();
		if (openState?.textContent === String(expectedOpen) && isOpen(content) === expectedOpen) {
			break;
		}
		await new Promise((resolve) => setTimeout(resolve, 10));
	}

	return {
		content,
		openState
	};
}

function isOpen(element: HTMLElement) {
	return element.matches(':popover-open');
}

async function openMenu() {
	const trigger = getTrigger();
	trigger.click();
	const { content, openState } = await waitForMenuState(true);

	return {
		trigger,
		content,
		openState
	};
}

describe('DropdownMenu', () => {
	it('renders menu semantics on the trigger and content while closed', () => {
		render(DropdownMenuHarness);

		const trigger = getTrigger();
		const content = getContent();
		const label = document.querySelector<HTMLElement>('[data-testid="dropdown-menu-label"]');
		const separator = document.querySelector<HTMLElement>(
			'[data-testid="dropdown-menu-separator"]'
		);
		const openState = document.querySelector<HTMLElement>('[data-testid="dropdown-menu-open"]');

		expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(trigger.getAttribute('popovertarget')).toBe(content.id);
		expect(content.getAttribute('role')).toBe('menu');
		expect(content.getAttribute('aria-labelledby')).toBe(trigger.id);
		expect(label?.getAttribute('data-dropdown-menu-label')).toBe('true');
		expect(separator?.getAttribute('data-dropdown-menu-separator')).toBe('true');
		expect(isOpen(content)).toBe(false);
		expect(openState?.textContent).toBe('false');
	});

	it('opens from the trigger and focuses the first enabled item', async () => {
		render(DropdownMenuHarness);

		const { trigger, content, openState } = await openMenu();
		const firstItem = getItem('dropdown-menu-item-edit');

		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(trigger.getAttribute('aria-controls')).toBe(content.id);
		expect(isOpen(content)).toBe(true);
		expect(openState?.textContent).toBe('true');
		expect(document.activeElement).toBe(firstItem);
	});

	it('moves focus across enabled items and closes after item selection', async () => {
		render(DropdownMenuHarness);

		const { trigger, content } = await openMenu();
		const firstItem = getItem('dropdown-menu-item-edit');
		const shareItem = getItem('dropdown-menu-item-share');
		const lastAction = document.querySelector<HTMLElement>(
			'[data-testid="dropdown-menu-last-action"]'
		);

		firstItem.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		flushSync();

		expect(document.activeElement).toBe(shareItem);

		shareItem.click();
		const { openState } = await waitForMenuState(false);

		expect(lastAction?.textContent).toBe('share');
		expect(openState?.textContent).toBe('false');
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(trigger.hasAttribute('aria-controls')).toBe(false);
		expect(isOpen(content)).toBe(false);
	});

	it('keeps disabled items inert and the menu open', async () => {
		render(DropdownMenuHarness);

		const { content } = await openMenu();
		const disabledItem = getItem('dropdown-menu-item-disabled');
		const lastAction = document.querySelector<HTMLElement>(
			'[data-testid="dropdown-menu-last-action"]'
		);

		disabledItem.click();
		const { openState } = await waitForMenuState(true);

		expect(disabledItem.getAttribute('aria-disabled')).toBe('true');
		expect(disabledItem.hasAttribute('data-disabled')).toBe(true);
		expect(disabledItem.hasAttribute('tabindex')).toBe(false);
		expect(lastAction?.textContent).toBe('none');
		expect(openState?.textContent).toBe('true');
		expect(isOpen(content)).toBe(true);
	});
});
