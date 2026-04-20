import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import DatePickerHarness from './fixtures/date-picker-harness.svelte';
import { render } from './_harness';

function getTrigger(): HTMLButtonElement {
	const trigger = document.querySelector<HTMLButtonElement>('[data-testid="date-picker-trigger"]');
	if (!trigger) throw new Error('Expected date picker trigger');
	return trigger;
}

function getContent(): HTMLDivElement {
	const content = document.querySelector<HTMLDivElement>('[data-testid="date-picker-content"]');
	if (!content) throw new Error('Expected date picker content');
	return content;
}

function getValueOutput(): HTMLOutputElement {
	const output = document.querySelector<HTMLOutputElement>('[data-testid="date-picker-value"]');
	if (!output) throw new Error('Expected date picker value output');
	return output;
}

function getOpenOutput(): HTMLOutputElement {
	const output = document.querySelector<HTMLOutputElement>('[data-testid="date-picker-open"]');
	if (!output) throw new Error('Expected date picker open output');
	return output;
}

function getHiddenInput(): HTMLInputElement {
	const input = document.querySelector<HTMLInputElement>('input[name="date"]');
	if (!input) throw new Error('Expected hidden date picker input');
	return input;
}

function getDay(isoDate: string): HTMLButtonElement {
	const day = document.querySelector<HTMLButtonElement>(`[data-calendar-day="${isoDate}"]`);
	if (!day) throw new Error(`Expected date picker day ${isoDate}`);
	return day;
}

async function waitForPopoverState(expectedOpen: boolean) {
	const content = getContent();

	for (let i = 0; i < 30; i += 1) {
		flushSync();
		if (content.matches(':popover-open') === expectedOpen) return;
		await new Promise((resolve) => setTimeout(resolve, 10));
	}

	throw new Error(`Expected date picker popover to be ${expectedOpen ? 'open' : 'closed'}`);
}

async function pressKey(target: HTMLElement, key: string) {
	target.dispatchEvent(
		new KeyboardEvent('keydown', {
			key,
			bubbles: true,
			cancelable: true
		})
	);
	flushSync();
	await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
	flushSync();
}

describe('DatePicker', () => {
	it('renders the trigger, popover wiring, and hidden input value', () => {
		render(DatePickerHarness);

		const trigger = getTrigger();
		const label = trigger.querySelector('span');

		expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(label?.textContent).toContain('April 18, 2026');
		expect(getHiddenInput().value).toBe('2026-04-18');
		expect(getOpenOutput().textContent).toBe('false');
		expect(getContent().hasAttribute('data-dp-content')).toBe(true);
	});

	it('selects a date with keyboard interaction and returns focus to the trigger', async () => {
		render(DatePickerHarness);

		const trigger = getTrigger();
		trigger.click();
		await waitForPopoverState(true);

		const april18 = getDay('2026-04-18');
		april18.focus();

		await pressKey(april18, 'ArrowRight');
		expect(document.activeElement).toBe(getDay('2026-04-19'));

		await pressKey(getDay('2026-04-19'), 'Enter');
		await new Promise((resolve) => setTimeout(resolve, 10));
		flushSync();

		expect(document.activeElement).toBe(trigger);
		expect(getValueOutput().textContent).toBe('2026-04-19');
		expect(getHiddenInput().value).toBe('2026-04-19');
		expect(trigger.querySelector('span')?.textContent).toContain('April 19, 2026');
	});

	it('closes on Escape and restores focus to the trigger', async () => {
		render(DatePickerHarness);

		const trigger = getTrigger();
		trigger.click();
		await waitForPopoverState(true);

		const april18 = getDay('2026-04-18');
		april18.focus();

		await pressKey(april18, 'Escape');
		await new Promise((resolve) => setTimeout(resolve, 10));
		flushSync();

		expect(document.activeElement).toBe(trigger);
		expect(getValueOutput().textContent).toBe('2026-04-18');
	});

	it('marks unavailable dates disabled and ignores selection attempts', async () => {
		render(DatePickerHarness);

		getTrigger().click();
		await waitForPopoverState(true);

		const unavailable = getDay('2026-04-09');

		expect(unavailable.disabled).toBe(true);
		expect(unavailable.getAttribute('aria-disabled')).toBe('true');

		unavailable.click();
		flushSync();

		expect(getValueOutput().textContent).toBe('2026-04-18');
		expect(getHiddenInput().value).toBe('2026-04-18');
		expect(getContent().matches(':popover-open')).toBe(true);
	});

	it('keeps the trigger disabled and the popover closed when disabled', async () => {
		render(DatePickerHarness, { disabled: true });

		const trigger = getTrigger();
		expect(trigger.disabled).toBe(true);
		expect(trigger.hasAttribute('data-disabled')).toBe(true);

		trigger.click();
		await waitForPopoverState(false);

		expect(getOpenOutput().textContent).toBe('false');
		expect(getHiddenInput().disabled).toBe(true);
	});
});
