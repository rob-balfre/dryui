interface CalendarKeydownOptions {
	onSelect: (date: Date) => void;
	onEscape: () => void;
	setFocusedDate: (date: Date) => void;
	weekStartDay: number;
	min: Date | null;
	max: Date | null;
}

type CalendarKeydownResult = { type: 'navigate'; newDate: Date } | null;

export function generateWeekdayLabels(locale: string, weekStartDay: number): string[] {
	const labels: string[] = [];
	for (let i = 0; i < 7; i++) {
		const dayIndex = (weekStartDay + i) % 7;
		// Jan 7 2024 = Sunday (getDay() === 0)
		const d = new Date(2024, 0, 7 + dayIndex);
		labels.push(new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d));
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
