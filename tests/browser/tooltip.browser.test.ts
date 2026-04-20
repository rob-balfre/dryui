import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import TooltipHarness from './fixtures/tooltip-harness.svelte';
import { render } from './_harness';

function getTrigger(): HTMLButtonElement {
	const trigger = document.querySelector<HTMLButtonElement>('[data-testid="tooltip-trigger"]');
	if (!(trigger instanceof HTMLButtonElement)) throw new Error('Expected tooltip trigger');
	return trigger;
}

function getTriggerWrap(): HTMLSpanElement {
	const triggerWrap = document.querySelector<HTMLSpanElement>(
		'[data-testid="tooltip-trigger-wrap"]'
	);
	if (!(triggerWrap instanceof HTMLSpanElement))
		throw new Error('Expected tooltip trigger wrapper');
	return triggerWrap;
}

function getContent(): HTMLDivElement {
	const content = document.querySelector<HTMLDivElement>('[data-testid="tooltip-content"]');
	if (!(content instanceof HTMLDivElement)) throw new Error('Expected tooltip content');
	return content;
}

function isOpen(element: HTMLElement) {
	return element.matches(':popover-open');
}

afterEach(() => {
	vi.useRealTimers();
});

describe('Tooltip', () => {
	it('renders a hidden tooltip with no initial description wiring', () => {
		render(TooltipHarness);

		const trigger = getTrigger();
		const content = getContent();

		expect(content.getAttribute('role')).toBe('tooltip');
		expect(isOpen(content)).toBe(false);
		expect(trigger.hasAttribute('aria-describedby')).toBe(false);
	});

	it('opens on hover after the configured delay and closes after mouse leave', () => {
		vi.useFakeTimers();
		render(TooltipHarness, { openDelay: 40, closeDelay: 30 });

		const trigger = getTrigger();
		const triggerWrap = getTriggerWrap();
		const content = getContent();

		triggerWrap.dispatchEvent(new MouseEvent('mouseenter'));
		vi.advanceTimersByTime(39);
		flushSync();

		expect(isOpen(content)).toBe(false);
		expect(trigger.hasAttribute('aria-describedby')).toBe(false);

		vi.advanceTimersByTime(1);
		flushSync();

		expect(isOpen(content)).toBe(true);
		expect(trigger.getAttribute('aria-describedby')).toBe(content.id);

		triggerWrap.dispatchEvent(new MouseEvent('mouseleave'));
		vi.advanceTimersByTime(29);
		flushSync();

		expect(isOpen(content)).toBe(true);

		vi.advanceTimersByTime(1);
		flushSync();

		expect(isOpen(content)).toBe(false);
		expect(trigger.hasAttribute('aria-describedby')).toBe(false);
	});

	it('opens immediately on focus and wires description to the nested trigger only', () => {
		render(TooltipHarness);

		const trigger = getTrigger();
		const triggerWrap = getTriggerWrap();
		const content = getContent();

		trigger.focus();
		trigger.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		flushSync();

		expect(isOpen(content)).toBe(true);
		expect(trigger.getAttribute('aria-describedby')).toBe(content.id);
		expect(triggerWrap.hasAttribute('aria-describedby')).toBe(false);

		trigger.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
		flushSync();

		expect(isOpen(content)).toBe(false);
		expect(trigger.hasAttribute('aria-describedby')).toBe(false);
	});
});
