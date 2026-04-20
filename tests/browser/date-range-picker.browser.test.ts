import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import DateRangePickerHarness from './fixtures/date-range-picker-harness.svelte';
import { render } from './_harness';

function formatShortDate(date: Date) {
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(date);
}

function getTrigger(): HTMLButtonElement {
	const trigger = document.querySelector<HTMLButtonElement>(
		'[data-testid="date-range-picker-trigger"]'
	);
	if (!trigger) throw new Error('Expected date range picker trigger');
	return trigger;
}

function getContent(): HTMLDivElement {
	const content = document.querySelector<HTMLDivElement>(
		'[data-testid="date-range-picker-content"]'
	);
	if (!content) throw new Error('Expected date range picker content');
	return content;
}

function getOpenOutput(): HTMLOutputElement {
	const output = document.querySelector<HTMLOutputElement>(
		'[data-testid="date-range-picker-open"]'
	);
	if (!output) throw new Error('Expected date range picker open output');
	return output;
}

function getStartOutput(): HTMLOutputElement {
	const output = document.querySelector<HTMLOutputElement>(
		'[data-testid="date-range-picker-start"]'
	);
	if (!output) throw new Error('Expected date range picker start output');
	return output;
}

function getEndOutput(): HTMLOutputElement {
	const output = document.querySelector<HTMLOutputElement>('[data-testid="date-range-picker-end"]');
	if (!output) throw new Error('Expected date range picker end output');
	return output;
}

function getDay(isoDate: string): HTMLButtonElement {
	const day = document.querySelector<HTMLButtonElement>(`[data-calendar-day="${isoDate}"]`);
	if (!day) throw new Error(`Expected date range picker day ${isoDate}`);
	return day;
}

function getCell(isoDate: string): HTMLDivElement {
	const cell = getDay(isoDate).closest<HTMLDivElement>('[data-calendar-cell]');
	if (!cell) throw new Error(`Expected date range picker cell ${isoDate}`);
	return cell;
}

async function waitForPopoverState(expectedOpen: boolean) {
	const content = getContent();

	for (let i = 0; i < 30; i += 1) {
		flushSync();
		if (content.matches(':popover-open') === expectedOpen) return;
		await new Promise((resolve) => setTimeout(resolve, 10));
	}

	throw new Error(`Expected date range picker popover to be ${expectedOpen ? 'open' : 'closed'}`);
}

async function waitForLogicalClosedState() {
	for (let i = 0; i < 30; i += 1) {
		flushSync();
		if (
			getOpenOutput().textContent === 'false' &&
			getTrigger().getAttribute('aria-expanded') === 'false' &&
			getContent().getAttribute('data-state') === 'closed'
		) {
			return;
		}
		await new Promise((resolve) => setTimeout(resolve, 10));
	}

	throw new Error('Expected date range picker logical open state to close');
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

describe('DateRangePicker', () => {
	it('renders a placeholder trigger and closed popover by default', () => {
		render(DateRangePickerHarness);

		const trigger = getTrigger();
		const label = trigger.querySelector('span');

		expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(label?.dataset.placeholder).toBe('');
		expect(label?.textContent).toContain('Pick date range');
		expect(getOpenOutput().textContent).toBe('false');
		expect(getContent().hasAttribute('data-drp-content')).toBe(true);
	});

	it('selects a start and end date, marks the range, and closes after completion', async () => {
		render(DateRangePickerHarness, {
			startDate: new Date(2026, 3, 12),
			endDate: null
		});

		const trigger = getTrigger();
		trigger.click();
		await waitForPopoverState(true);

		getDay('2026-04-12').click();
		flushSync();

		expect(getStartOutput().textContent).toBe('2026-04-12');
		expect(getEndOutput().textContent).toBe('null');
		expect(getContent().matches(':popover-open')).toBe(true);

		getDay('2026-04-18').click();
		await waitForLogicalClosedState();

		expect(getStartOutput().textContent).toBe('2026-04-12');
		expect(getEndOutput().textContent).toBe('2026-04-18');
		expect(getCell('2026-04-12').hasAttribute('data-range-start')).toBe(true);
		expect(getCell('2026-04-15').hasAttribute('data-in-range')).toBe(true);
		expect(getCell('2026-04-18').hasAttribute('data-range-end')).toBe(true);
		expect(trigger.querySelector('span')?.textContent).toContain(
			formatShortDate(new Date(2026, 3, 12))
		);
		expect(trigger.querySelector('span')?.textContent).toContain(
			formatShortDate(new Date(2026, 3, 18))
		);
		expect(getOpenOutput().textContent).toBe('false');
	});

	it('moves focus within the grid and returns focus to the trigger on Escape', async () => {
		render(DateRangePickerHarness, {
			startDate: new Date(2026, 3, 12),
			endDate: null
		});

		const trigger = getTrigger();
		trigger.click();
		await waitForPopoverState(true);

		const april12 = getDay('2026-04-12');
		april12.focus();

		await pressKey(april12, 'ArrowRight');
		expect(document.activeElement).toBe(getDay('2026-04-13'));

		await pressKey(getDay('2026-04-13'), 'Escape');
		await new Promise((resolve) => setTimeout(resolve, 10));
		flushSync();

		expect(document.activeElement).toBe(trigger);
	});

	it('marks unavailable dates disabled and ignores clicks on them', async () => {
		render(DateRangePickerHarness, {
			startDate: new Date(2026, 3, 12),
			endDate: null
		});

		getTrigger().click();
		await waitForPopoverState(true);

		const unavailable = getDay('2026-04-09');

		expect(unavailable.disabled).toBe(true);
		expect(unavailable.getAttribute('aria-disabled')).toBe('true');

		unavailable.click();
		flushSync();

		expect(getStartOutput().textContent).toBe('2026-04-12');
		expect(getEndOutput().textContent).toBe('null');
		expect(getContent().matches(':popover-open')).toBe(true);
	});

	it('keeps the trigger disabled and the popover closed when disabled', async () => {
		render(DateRangePickerHarness, { disabled: true });

		const trigger = getTrigger();

		expect(trigger.disabled).toBe(true);
		expect(trigger.hasAttribute('data-disabled')).toBe(true);

		trigger.click();
		await waitForPopoverState(false);

		expect(getOpenOutput().textContent).toBe('false');
	});
});
