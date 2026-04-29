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

function getCalendarEvents(isoDate: string): NodeListOf<HTMLElement> {
	return getCell(isoDate).querySelectorAll<HTMLElement>('[data-calendar-event]');
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

	it('can render two visible months without duplicate date targets', async () => {
		render(CalendarHarness, {
			max: new Date(2026, 4, 31),
			visibleMonths: 2,
			eventDisplay: 'bars',
			events: [
				{
					id: 'may-event',
					title: 'May event',
					start: new Date(2026, 4, 1),
					kind: 'trip',
					tone: 'info'
				}
			]
		});
		flushSync();

		expect(getGrid().getAttribute('data-visible-months')).toBe('2');
		expect(getGrid().querySelectorAll('[data-calendar-month-panel]')).toHaveLength(2);
		expect(getGrid().querySelectorAll('[data-calendar-month-heading]')).toHaveLength(0);
		expect(getHeading().textContent).toBe('April - May 2026');
		expect(getGrid().textContent).not.toContain('April 2026');
		expect(getGrid().textContent).not.toContain('May 2026');
		expect(document.querySelectorAll('[data-calendar-day="2026-05-01"]')).toHaveLength(1);
		expect(getCell('2026-05-01').hasAttribute('data-outside-month')).toBe(false);
		expect(getCalendarEvents('2026-05-01')).toHaveLength(1);

		const april30 = getDay('2026-04-30');
		april30.focus();

		await pressKey(april30, 'ArrowRight');
		expect(document.activeElement).toBe(getDay('2026-05-01'));
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

	it('renders event dots and includes event summaries in day labels', () => {
		render(CalendarHarness, {
			maxEventLanes: 1,
			events: [
				{
					id: 'flight',
					title: 'Flight to Paris',
					start: new Date(2026, 3, 18),
					kind: 'flight',
					tone: 'info',
					priority: 10
				},
				{
					id: 'hotel',
					title: 'Hotel check-in',
					start: new Date(2026, 3, 18),
					kind: 'hotel',
					tone: 'success'
				}
			]
		});

		const events = getCalendarEvents('2026-04-18');
		const overflow = getCell('2026-04-18').querySelector<HTMLElement>(
			'[data-calendar-event-overflow]'
		);

		expect(events).toHaveLength(1);
		expect(events[0]?.getAttribute('data-calendar-event-kind')).toBe('flight');
		expect(events[0]?.getAttribute('data-calendar-event-tone')).toBe('info');
		expect(overflow?.textContent).toBe('+1');
		expect(getDay('2026-04-18').getAttribute('aria-label')).toContain(
			'2 events: Flight to Paris, Hotel check-in'
		);
	});

	it('renders multi-day events as bar segments', () => {
		render(CalendarHarness, {
			eventDisplay: 'bars',
			events: [
				{
					id: 'hotel',
					title: 'Hotel stay',
					start: new Date(2026, 3, 18),
					end: new Date(2026, 3, 20),
					kind: 'hotel',
					tone: 'success'
				}
			]
		});

		const start = getCalendarEvents('2026-04-18')[0];
		const middle = getCalendarEvents('2026-04-19')[0];
		const end = getCalendarEvents('2026-04-20')[0];

		expect(start?.getAttribute('data-calendar-event-position')).toBe('start');
		expect(middle?.getAttribute('data-calendar-event-position')).toBe('middle');
		expect(end?.getAttribute('data-calendar-event-position')).toBe('end');
		expect(start?.textContent).toBe('Hotel stay');
	});
});
