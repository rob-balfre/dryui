import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import PopoverHarness from './fixtures/popover-harness.svelte';
import { render } from './_harness';

function getTrigger(): HTMLButtonElement {
	const trigger = document.querySelector<HTMLButtonElement>('[data-testid="popover-trigger"]');
	if (!(trigger instanceof HTMLButtonElement)) throw new Error('Expected popover trigger');
	return trigger;
}

function getContent(): HTMLDivElement {
	const content = document.querySelector<HTMLDivElement>('[data-testid="popover-content"]');
	if (!(content instanceof HTMLDivElement)) throw new Error('Expected popover content');
	return content;
}

function isOpen(element: HTMLElement) {
	return element.matches(':popover-open');
}

function openPopover() {
	const trigger = getTrigger();
	trigger.click();
	flushSync();

	return {
		trigger,
		content: getContent()
	};
}

describe('Popover', () => {
	it('renders closed trigger semantics and a hidden popover content panel', () => {
		render(PopoverHarness);

		const trigger = getTrigger();
		const content = getContent();
		const openState = document.querySelector<HTMLElement>('[data-testid="popover-open"]');

		expect(trigger.getAttribute('aria-controls')).toBe(content.id);
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(content.getAttribute('data-state')).toBe('closed');
		expect(isOpen(content)).toBe(false);
		expect(openState?.textContent).toBe('false');
	});

	it('opens from the trigger, keeps interactive content live, and dismisses on outside pointerdown', () => {
		render(PopoverHarness);

		const { trigger, content } = openPopover();
		const action = document.querySelector<HTMLButtonElement>('[data-testid="popover-action"]');
		const confirmCount = document.querySelector<HTMLElement>(
			'[data-testid="popover-confirm-count"]'
		);
		const openState = document.querySelector<HTMLElement>('[data-testid="popover-open"]');

		if (!(action instanceof HTMLButtonElement)) throw new Error('Expected popover action');

		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(content.getAttribute('data-state')).toBe('open');
		expect(isOpen(content)).toBe(true);

		action.click();
		flushSync();

		expect(confirmCount?.textContent).toBe('1');
		expect(openState?.textContent).toBe('true');
		expect(isOpen(content)).toBe(true);

		document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		flushSync();

		expect(openState?.textContent).toBe('false');
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(isOpen(content)).toBe(false);
	});

	it('closes on Escape and returns focus to the trigger', () => {
		render(PopoverHarness);

		const { trigger, content } = openPopover();
		const input = document.querySelector<HTMLInputElement>('[data-testid="popover-input"]');
		const openState = document.querySelector<HTMLElement>('[data-testid="popover-open"]');

		if (!(input instanceof HTMLInputElement)) throw new Error('Expected popover input');

		input.focus();
		input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		flushSync();

		expect(openState?.textContent).toBe('false');
		expect(isOpen(content)).toBe(false);
		expect(document.activeElement).toBe(trigger);
	});
});
