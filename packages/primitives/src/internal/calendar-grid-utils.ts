/**
 * Shared utilities for calendar grid components.
 *
 * Extracts the duplicated weekday-label generation, 42→7-row splitting,
 * ISO string formatting, and keyboard navigation logic that was copy-pasted
 * across calendar-grid, range-calendar-grid, price-calendar-grid,
 * datepicker-calendar, and date-range-picker-calendar.
 */

import { addMonths } from '../utils/date-utils.js';

/* -------------------------------------------------------------------------- */
/*  Weekday labels                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Generate locale-aware short weekday labels starting from `weekStartDay`.
 * Jan 4 1970 is a Sunday — used as the reference anchor.
 */
export function generateWeekdayLabels(locale: string, weekStartDay: number): string[] {
	const labels: string[] = [];
	for (let i = 0; i < 7; i++) {
		const dayIndex = (weekStartDay + i) % 7;
		const date = new Date(1970, 0, 4 + dayIndex);
		labels.push(new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date));
	}
	return labels;
}

/* -------------------------------------------------------------------------- */
/*  Weeks (42-cell → rows of 7)                                               */
/* -------------------------------------------------------------------------- */

/**
 * Split an array of 42 calendar days into rows of 7.
 *
 * When `trimTrailingOutsideRow` is true the last row is dropped if every
 * date in it falls outside `viewMonth` (used by price-calendar).
 */
export function splitIntoWeeks(
	calendarDays: Date[],
	opts?: { trimTrailingOutsideRow?: boolean; viewMonth?: number }
): Date[][] {
	const rows: Date[][] = [];
	for (let i = 0; i < 42; i += 7) {
		rows.push(calendarDays.slice(i, i + 7));
	}
	if (opts?.trimTrailingOutsideRow && opts.viewMonth !== undefined) {
		const lastRow = rows[rows.length - 1];
		if (lastRow && lastRow.every((d) => d.getMonth() !== opts.viewMonth)) {
			rows.pop();
		}
	}
	return rows;
}

/* -------------------------------------------------------------------------- */
/*  ISO date string                                                           */
/* -------------------------------------------------------------------------- */

/** Format a Date as `YYYY-MM-DD` without relying on `toISOString()` (avoids UTC shift). */
export function getDayISOString(day: Date): string {
	const y = day.getFullYear();
	const m = String(day.getMonth() + 1).padStart(2, '0');
	const d = String(day.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

/* -------------------------------------------------------------------------- */
/*  Keyboard navigation                                                       */
/* -------------------------------------------------------------------------- */

interface CalendarKeydownCallbacks {
	/** Called for Enter / Space on an in-range day. */
	onSelect: (day: Date) => void;
	/** Called for Escape — only date-picker and date-range-picker use this. */
	onEscape?: () => void;
	/** Move the focused date and update the view month/year if needed. */
	setFocusedDate: (date: Date) => void;
	/** First day of the week (0 = Sun, 1 = Mon, ...). */
	weekStartDay: number;
	/** Min/max bounds — used to gate Enter/Space selection. */
	min?: Date | null;
	max?: Date | null;
	/**
	 * Whether PageUp/PageDown and Home/End are supported.
	 * Defaults to true; set to false for price-calendar which only uses arrow keys.
	 */
	extendedNav?: boolean;
}

/**
 * Compute the target date for a keyboard event on a calendar grid.
 *
 * Returns `{ newDate }` when the focus should move, `{ selected: true }` when
 * the day should be selected, `{ escaped: true }` when Escape was pressed, or
 * `null` if the key was not handled.
 *
 * The caller is responsible for focusing the DOM button after a focus move.
 */
export function handleCalendarKeydown(
	e: KeyboardEvent,
	day: Date,
	cb: CalendarKeydownCallbacks
): { type: 'navigate'; newDate: Date } | { type: 'select' } | { type: 'escape' } | null {
	const extendedNav = cb.extendedNav !== false;
	let newDate: Date | null = null;

	switch (e.key) {
		case 'ArrowLeft': {
			e.preventDefault();
			newDate = new Date(day);
			newDate.setDate(newDate.getDate() - 1);
			break;
		}
		case 'ArrowRight': {
			e.preventDefault();
			newDate = new Date(day);
			newDate.setDate(newDate.getDate() + 1);
			break;
		}
		case 'ArrowUp': {
			e.preventDefault();
			newDate = new Date(day);
			newDate.setDate(newDate.getDate() - 7);
			break;
		}
		case 'ArrowDown': {
			e.preventDefault();
			newDate = new Date(day);
			newDate.setDate(newDate.getDate() + 7);
			break;
		}
		case 'PageUp': {
			if (!extendedNav) return null;
			e.preventDefault();
			newDate = addMonths(day, e.shiftKey ? -12 : -1);
			break;
		}
		case 'PageDown': {
			if (!extendedNav) return null;
			e.preventDefault();
			newDate = addMonths(day, e.shiftKey ? 12 : 1);
			break;
		}
		case 'Home': {
			if (!extendedNav) return null;
			e.preventDefault();
			const dow = (day.getDay() - cb.weekStartDay + 7) % 7;
			newDate = new Date(day);
			newDate.setDate(newDate.getDate() - dow);
			break;
		}
		case 'End': {
			if (!extendedNav) return null;
			e.preventDefault();
			const dow = (day.getDay() - cb.weekStartDay + 7) % 7;
			newDate = new Date(day);
			newDate.setDate(newDate.getDate() + (6 - dow));
			break;
		}
		case 'Enter':
		case ' ': {
			e.preventDefault();
			cb.onSelect(day);
			return { type: 'select' };
		}
		case 'Escape': {
			if (!cb.onEscape) return null;
			e.preventDefault();
			cb.onEscape();
			return { type: 'escape' };
		}
		default:
			return null;
	}

	if (newDate) {
		cb.setFocusedDate(newDate);
		return { type: 'navigate', newDate };
	}

	return null;
}

/**
 * After a navigate result, focus the button for `newDate` inside `container`.
 * Call inside `requestAnimationFrame` to wait for the DOM update.
 */
export function focusCalendarDay(container: HTMLElement | undefined | null, newDate: Date): void {
	if (!container) return;
	const btn = container.querySelector<HTMLButtonElement>(
		`[data-calendar-day="${getDayISOString(newDate)}"]`
	);
	btn?.focus();
}
