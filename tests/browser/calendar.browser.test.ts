import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import CalendarHarness from './fixtures/calendar-harness.svelte';
import { render } from './_harness';

function getRoot(): HTMLDivElement {
	const root = document.querySelector<HTMLDivElement>('[data-testid="calendar-root"]');
	if (!root) throw new Error('Expected calendar root');
	return root;
}

function getHeader(): HTMLDivElement {
	const header = document.querySelector<HTMLDivElement>('[data-testid="calendar-header"]');
	if (!header) throw new Error('Expected calendar header');
	return header;
}

function getGrid(): HTMLDivElement {
	const grid = document.querySelector<HTMLDivElement>('[data-testid="calendar-grid"]');
	if (!grid) throw new Error('Expected calendar grid');
	return grid;
}

function getHeading(): HTMLSpanElement {
	const heading = document.querySelector<HTMLSpanElement>('[data-testid="calendar-heading"]');
	if (!heading) throw new Error('Expected calendar heading');
	return heading;
}

function getDay(isoDate: string): HTMLButtonElement {
	const day = document.querySelector<HTMLButtonElement>(`[data-calendar-day="${isoDate}"]`);
	if (!day) throw new Error(`Expected calendar day ${isoDate}`);
	return day;
}

function getCell(isoDate: string): HTMLDivElement {
	const cell = getDay(isoDate).closest<HTMLDivElement>('[data-calendar-cell]');
	if (!cell) throw new Error(`Expected calendar cell for ${isoDate}`);
	return cell;
}

function getValueOutput(): HTMLOutputElement {
	const output = document.querySelector<HTMLOutputElement>('[data-testid="calendar-value"]');
	if (!output) throw new Error('Expected calendar value output');
	return output;
}

async function pressKey(
	target: HTMLElement,
	key: string,
	options: Pick<KeyboardEventInit, 'shiftKey'> = {}
) {
	target.dispatchEvent(
		new KeyboardEvent('keydown', {
			key,
			bubbles: true,
			cancelable: true,
			...options
		})
	);
	flushSync();
	await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
	flushSync();
}

describe('Calendar', () => {
	it('renders the root, header, grid, and initial bound value', () => {
		render(CalendarHarness);

		expect(getRoot().hasAttribute('data-calendar')).toBe(true);
		expect(getHeader().hasAttribute('data-calendar-header')).toBe(true);
		expect(getGrid().hasAttribute('data-calendar-grid')).toBe(true);
		expect(getHeading().hasAttribute('data-calendar-heading')).toBe(true);
		expect(getHeading().textContent).toBe('April 2026');
		expect(getValueOutput().textContent).toBe('2026-04-18');
		expect(getCell('2026-04-18').hasAttribute('data-selected')).toBe(true);
	});

	it('moves focus with keyboard navigation and updates the visible month', async () => {
		render(CalendarHarness);

		const april18 = getDay('2026-04-18');
		april18.focus();

		await pressKey(april18, 'ArrowRight');
		expect(document.activeElement).toBe(getDay('2026-04-19'));

		const next = document.querySelector<HTMLButtonElement>('[data-testid="calendar-next"]');
		if (!next) throw new Error('Expected calendar next button');
		next.click();
		flushSync();

		expect(getHeading().textContent).toBe('May 2026');
	});

	it('updates the bound value when an available day is clicked', () => {
		render(CalendarHarness);

		getDay('2026-04-20').click();
		flushSync();

		expect(getValueOutput().textContent).toBe('2026-04-20');
		expect(getDay('2026-04-20').getAttribute('aria-pressed')).toBe('true');
		expect(getCell('2026-04-20').hasAttribute('data-selected')).toBe(true);
	});

	it('marks unavailable dates disabled and ignores clicks on them', () => {
		render(CalendarHarness);

		const unavailable = getDay('2026-04-09');

		expect(unavailable.disabled).toBe(true);
		expect(unavailable.getAttribute('aria-disabled')).toBe('true');

		unavailable.click();
		flushSync();

		expect(getValueOutput().textContent).toBe('2026-04-18');
		expect(getCell('2026-04-09').hasAttribute('data-selected')).toBe(false);
	});
});
