import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import ContextMenuHarness from './fixtures/context-menu-harness.svelte';
import { render } from './_harness';

function getTrigger(): HTMLDivElement {
	const trigger = document.querySelector<HTMLDivElement>('[data-testid="context-menu-trigger"]');
	if (!(trigger instanceof HTMLDivElement)) throw new Error('Expected context menu trigger');
	return trigger;
}

function getContent(): HTMLDivElement {
	const content = document.querySelector<HTMLDivElement>('[data-testid="context-menu-content"]');
	if (!(content instanceof HTMLDivElement)) throw new Error('Expected context menu content');
	return content;
}

function getItem(testId: string): HTMLDivElement {
	const item = document.querySelector<HTMLDivElement>(`[data-testid="${testId}"]`);
	if (!(item instanceof HTMLDivElement)) throw new Error(`Expected menu item ${testId}`);
	return item;
}

function isOpen(element: HTMLElement) {
	return element.matches(':popover-open');
}

function openMenu() {
	const trigger = getTrigger();

	trigger.dispatchEvent(
		new MouseEvent('contextmenu', {
			bubbles: true,
			cancelable: true,
			clientX: 64,
			clientY: 96
		})
	);
	flushSync();

	return {
		trigger,
		content: getContent()
	};
}

describe('ContextMenu', () => {
	it('renders closed semantics with content labeled by the trigger', () => {
		render(ContextMenuHarness);

		const trigger = getTrigger();
		const content = getContent();
		const label = document.querySelector<HTMLElement>('[data-testid="context-menu-label"]');
		const separator = document.querySelector<HTMLElement>('[data-testid="context-menu-separator"]');
		const openState = document.querySelector<HTMLElement>('[data-testid="context-menu-open"]');

		expect(trigger.getAttribute('data-state')).toBe('closed');
		expect(content.getAttribute('role')).toBe('menu');
		expect(content.getAttribute('aria-labelledby')).toBe(trigger.id);
		expect(label?.getAttribute('data-context-menu-label')).toBe('true');
		expect(separator?.getAttribute('data-context-menu-separator')).toBe('true');
		expect(isOpen(content)).toBe(false);
		expect(openState?.textContent).toBe('false');
	});

	it('opens on contextmenu and focuses the first enabled item', () => {
		render(ContextMenuHarness);

		const { trigger, content } = openMenu();
		const firstItem = getItem('context-menu-item-open');

		expect(trigger.getAttribute('data-state')).toBe('open');
		expect(content.getAttribute('data-state')).toBe('open');
		expect(isOpen(content)).toBe(true);
		expect(document.activeElement).toBe(firstItem);
	});

	it('supports keyboard navigation across enabled items and closes after selection', () => {
		render(ContextMenuHarness);

		openMenu();

		const firstItem = getItem('context-menu-item-open');
		const shareItem = getItem('context-menu-item-share');
		const content = getContent();
		const lastAction = document.querySelector<HTMLElement>(
			'[data-testid="context-menu-last-action"]'
		);
		const openState = document.querySelector<HTMLElement>('[data-testid="context-menu-open"]');

		firstItem.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		flushSync();

		expect(document.activeElement).toBe(shareItem);

		shareItem.click();
		flushSync();

		expect(lastAction?.textContent).toBe('share');
		expect(openState?.textContent).toBe('false');
		expect(isOpen(content)).toBe(false);
	});

	it('keeps disabled items inert while the menu stays open', () => {
		render(ContextMenuHarness);

		const { content } = openMenu();
		const disabledItem = getItem('context-menu-item-disabled');
		const lastAction = document.querySelector<HTMLElement>(
			'[data-testid="context-menu-last-action"]'
		);
		const openState = document.querySelector<HTMLElement>('[data-testid="context-menu-open"]');

		disabledItem.click();
		flushSync();

		expect(disabledItem.getAttribute('aria-disabled')).toBe('true');
		expect(disabledItem.hasAttribute('data-disabled')).toBe(true);
		expect(disabledItem.hasAttribute('tabindex')).toBe(false);
		expect(lastAction?.textContent).toBe('none');
		expect(openState?.textContent).toBe('true');
		expect(isOpen(content)).toBe(true);
	});
});
