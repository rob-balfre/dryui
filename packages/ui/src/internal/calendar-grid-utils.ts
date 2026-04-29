import { formatDate } from '@dryui/primitives';
import type { CalendarVisibleMonths } from './calendar-event-layout.js';

interface CalendarKeydownOptions {
	onSelect: (date: Date) => void;
	onEscape: () => void;
	setFocusedDate: (date: Date) => void;
	weekStartDay: number;
	min: Date | null;
	max: Date | null;
}

type CalendarKeydownResult = { type: 'navigate'; newDate: Date } | null;

export function normalizeVisibleMonths(
	value: CalendarVisibleMonths | undefined
): CalendarVisibleMonths {
	return value === 2 ? 2 : 1;
}

export function formatVisibleMonthRangeLabel(
	year: number,
	month: number,
	locale: string,
	visibleMonths: CalendarVisibleMonths = 1
): string {
	const monthCount = normalizeVisibleMonths(visibleMonths);
	const firstDate = new Date(year, month, 1);
	const firstLabel = formatDate(firstDate, locale, {
		month: 'long',
		year: 'numeric'
	});

	if (monthCount === 1) return firstLabel;

	const lastDate = new Date(year, month + monthCount - 1, 1);
	const lastLabel = formatDate(lastDate, locale, {
		month: 'long',
		year: 'numeric'
	});

	if (firstDate.getFullYear() !== lastDate.getFullYear()) {
		return `${firstLabel} - ${lastLabel}`;
	}

	const firstMonthLabel = formatDate(firstDate, locale, { month: 'long' });
	return `${firstMonthLabel} - ${lastLabel}`;
}

export function generateWeekdayLabels(locale: string, weekStartDay: number): string[] {
	const formatter = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
	const labels: string[] = [];
	for (let i = 0; i < 7; i++) {
		const dayIndex = (weekStartDay + i) % 7;
		// Jan 7 2024 = Sunday (getDay() === 0)
		const d = new Date(2024, 0, 7 + dayIndex);
		labels.push(formatter.format(d));
	}
	return labels;
}

export function splitIntoWeeks(days: Date[]): Date[][] {
	const weeks: Date[][] = [];
	for (let i = 0; i < days.length; i += 7) {
		weeks.push(days.slice(i, i + 7));
	}
	return weeks;
}

export function getDayISOString(day: Date): string {
	const year = day.getFullYear();
	const month = String(day.getMonth() + 1).padStart(2, '0');
	const date = String(day.getDate()).padStart(2, '0');
	return `${year}-${month}-${date}`;
}

export function handleCalendarKeydown(
	e: KeyboardEvent,
	day: Date,
	options: CalendarKeydownOptions
): CalendarKeydownResult {
	const { onSelect, onEscape, setFocusedDate } = options;
	let delta = 0;

	switch (e.key) {
		case 'ArrowRight':
			delta = 1;
			break;
		case 'ArrowLeft':
			delta = -1;
			break;
		case 'ArrowDown':
			delta = 7;
			break;
		case 'ArrowUp':
			delta = -7;
			break;
		case 'Enter':
		case ' ':
			e.preventDefault();
			onSelect(day);
			return null;
		case 'Escape':
			e.preventDefault();
			onEscape();
			return null;
		default:
			return null;
	}

	e.preventDefault();
	const newDate = new Date(day);
	newDate.setDate(newDate.getDate() + delta);
	setFocusedDate(newDate);
	return { type: 'navigate', newDate };
}

export function focusCalendarDay(container: HTMLElement | undefined, date: Date): void {
	if (!container) return;
	const iso = getDayISOString(date);
	const el = container.querySelector<HTMLElement>(`[data-calendar-day="${iso}"]`);
	el?.focus();
}
