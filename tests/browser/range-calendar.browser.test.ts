import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import RangeCalendarHarness from './fixtures/range-calendar-harness.svelte';
import { render } from './_harness';

function getRoot(): HTMLDivElement {
	const root = document.querySelector<HTMLDivElement>('[data-testid="range-calendar-root"]');
	if (!root) throw new Error('Expected range calendar root');
	return root;
}

function getGrid(): HTMLDivElement {
	const grid = document.querySelector<HTMLDivElement>('[data-testid="range-calendar-grid"]');
	if (!grid) throw new Error('Expected range calendar grid');
	return grid;
}

function getStartOutput(): HTMLOutputElement {
	const output = document.querySelector<HTMLOutputElement>('[data-testid="range-calendar-start"]');
	if (!output) throw new Error('Expected range calendar start output');
	return output;
}

function getEndOutput(): HTMLOutputElement {
	const output = document.querySelector<HTMLOutputElement>('[data-testid="range-calendar-end"]');
	if (!output) throw new Error('Expected range calendar end output');
	return output;
}

function getDay(isoDate: string): HTMLButtonElement {
	const day = document.querySelector<HTMLButtonElement>(`[data-calendar-day="${isoDate}"]`);
	if (!day) throw new Error(`Expected range calendar day ${isoDate}`);
	return day;
}

function getCell(isoDate: string): HTMLDivElement {
	const cell = getDay(isoDate).closest<HTMLDivElement>('[data-calendar-cell]');
	if (!cell) throw new Error(`Expected range calendar cell ${isoDate}`);
	return cell;
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

describe('RangeCalendar', () => {
	it('renders the root, shared grid surface, and bound range values', () => {
		render(RangeCalendarHarness);

		expect(getRoot().hasAttribute('data-range-calendar-root')).toBe(true);
		expect(getGrid().hasAttribute('data-calendar-grid')).toBe(true);
		expect(getStartOutput().textContent).toBe('2026-04-12');
		expect(getEndOutput().textContent).toBe('2026-04-16');
		expect(getCell('2026-04-12').hasAttribute('data-range-start')).toBe(true);
		expect(getCell('2026-04-14').hasAttribute('data-in-range')).toBe(true);
		expect(getCell('2026-04-16').hasAttribute('data-range-end')).toBe(true);
	});

	it('supports selecting a range in reverse order and swaps the bound values', () => {
		render(RangeCalendarHarness, {
			startDate: new Date(2026, 3, 18),
			endDate: null
		});

		getDay('2026-04-18').click();
		flushSync();
		getDay('2026-04-14').click();
		flushSync();

		expect(getStartOutput().textContent).toBe('2026-04-14');
		expect(getEndOutput().textContent).toBe('2026-04-18');
		expect(getCell('2026-04-14').hasAttribute('data-range-start')).toBe(true);
		expect(getCell('2026-04-16').hasAttribute('data-in-range')).toBe(true);
		expect(getCell('2026-04-18').hasAttribute('data-range-end')).toBe(true);
	});

	it('moves focus between days with keyboard navigation', async () => {
		render(RangeCalendarHarness, {
			startDate: new Date(2026, 3, 18),
			endDate: null
		});

		const april18 = getDay('2026-04-18');
		april18.focus();

		await pressKey(april18, 'ArrowRight');
		expect(document.activeElement).toBe(getDay('2026-04-19'));
	});

	it('marks unavailable dates disabled and ignores clicks on them', () => {
		render(RangeCalendarHarness, {
			startDate: new Date(2026, 3, 18),
			endDate: null
		});

		const unavailable = getDay('2026-04-09');

		expect(unavailable.disabled).toBe(true);
		expect(unavailable.getAttribute('aria-disabled')).toBe('true');

		unavailable.click();
		flushSync();

		expect(getStartOutput().textContent).toBe('2026-04-18');
		expect(getEndOutput().textContent).toBe('null');
	});
});
