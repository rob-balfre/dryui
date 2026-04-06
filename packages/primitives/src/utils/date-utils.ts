/**
 * Pure date math utilities — no Svelte, plain TypeScript.
 */

export function getDaysInMonth(year: number, month: number): number {
	// month is 0-indexed; using day 0 of next month gives last day of current month
	return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
	return new Date(year, month, 1).getDay();
}

export function getWeekStartDay(locale: string): number {
	try {
		const localeObj: object = new Intl.Locale(locale);
		// weekInfo is a non-standard but widely-supported extension
		if (
			'weekInfo' in localeObj &&
			localeObj.weekInfo != null &&
			typeof localeObj.weekInfo === 'object'
		) {
			const info: object = localeObj.weekInfo;
			if ('firstDay' in info && typeof info.firstDay === 'number') {
				// Intl firstDay: 1=Mon, 7=Sun; convert to 0=Sun, 1=Mon, ...6=Sat
				const firstDay = info.firstDay;
				return firstDay === 7 ? 0 : firstDay;
			}
		}
	} catch {
		// Invalid locale — fall through
	}
	// Default: Sunday
	return 0;
}

export function isSameDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

export function isToday(date: Date): boolean {
	return isSameDay(date, new Date());
}

export function isDateInRange(date: Date, min?: Date | null, max?: Date | null): boolean {
	const time = date.getTime();
	if (min && time < min.getTime()) return false;
	if (max && time > max.getTime()) return false;
	return true;
}

export function formatDate(
	date: Date,
	locale: string,
	options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
): string {
	return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Returns an array of exactly 42 Date objects representing the 6-week calendar
 * grid for the given month. Days before and after the target month are padded
 * from adjacent months.
 */
export function getCalendarDays(year: number, month: number, weekStartDay: number): Date[] {
	const firstDay = getFirstDayOfMonth(year, month);
	const daysInMonth = getDaysInMonth(year, month);

	// How many days from the previous month we need to show
	const leadingDays = (firstDay - weekStartDay + 7) % 7;

	const days: Date[] = [];

	// Previous month padding
	const prevMonthDate = new Date(year, month, 0); // last day of previous month
	const prevMonthDays = prevMonthDate.getDate();
	for (let i = leadingDays - 1; i >= 0; i--) {
		days.push(new Date(year, month - 1, prevMonthDays - i));
	}

	// Current month
	for (let d = 1; d <= daysInMonth; d++) {
		days.push(new Date(year, month, d));
	}

	// Next month padding to fill 42 cells
	const trailingDays = 42 - days.length;
	for (let d = 1; d <= trailingDays; d++) {
		days.push(new Date(year, month + 1, d));
	}

	return days;
}

export function addMonths(date: Date, n: number): Date {
	const result = new Date(date);
	const originalDay = result.getDate();
	result.setDate(1);
	result.setMonth(result.getMonth() + n);
	const daysInTargetMonth = getDaysInMonth(result.getFullYear(), result.getMonth());
	result.setDate(Math.min(originalDay, daysInTargetMonth));
	return result;
}

export function addYears(date: Date, n: number): Date {
	const result = new Date(date);
	result.setFullYear(result.getFullYear() + n);
	return result;
}
