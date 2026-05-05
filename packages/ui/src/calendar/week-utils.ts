import { isSameDay } from '@dryui/primitives';
import type { CalendarEvent, DayBandEvent, PositionedEvent } from './types.js';

export function startOfDay(date: Date): Date {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}

export function addDays(date: Date, n: number): Date {
	const d = new Date(date);
	d.setDate(d.getDate() + n);
	return d;
}

export function getWeekDays(focused: Date, weekStartDay: number): Date[] {
	const start = startOfDay(focused);
	const offset = (start.getDay() - weekStartDay + 7) % 7;
	const monday = addDays(start, -offset);
	return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function dayMinutes(date: Date): number {
	return date.getHours() * 60 + date.getMinutes();
}

export function isMultiDay(event: CalendarEvent): boolean {
	if (event.allDay) return true;
	return !isSameDay(event.start, event.end);
}

interface PositionedAccumulator {
	dayIndex: number;
	startMinutes: number;
	endMinutes: number;
	event: CalendarEvent;
}

function overlaps(a: PositionedAccumulator, b: PositionedAccumulator): boolean {
	return (
		a.dayIndex === b.dayIndex && a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes
	);
}

export function layoutWeekEvents(
	events: CalendarEvent[],
	weekDays: Date[],
	startHour: number,
	endHour: number
): { positioned: PositionedEvent[]; band: DayBandEvent[] } {
	const positioned: PositionedEvent[] = [];
	const band: DayBandEvent[] = [];
	const minMinutes = startHour * 60;
	const maxMinutes = endHour * 60;

	const accumulator: PositionedAccumulator[] = [];

	const sortedBand: { event: CalendarEvent; startDayIndex: number; endDayIndex: number }[] = [];

	for (const event of events) {
		const isMulti = isMultiDay(event);

		if (isMulti) {
			const startIdx = weekDays.findIndex(
				(d) => isSameDay(d, event.start) || d.getTime() > startOfDay(event.start).getTime()
			);
			const endIdx = (() => {
				let last = -1;
				weekDays.forEach((d, i) => {
					if (d.getTime() <= startOfDay(event.end).getTime()) last = i;
				});
				return last;
			})();

			if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
				sortedBand.push({
					event,
					startDayIndex: Math.max(0, startIdx),
					endDayIndex: Math.min(6, endIdx)
				});
			}
			continue;
		}

		const dayIndex = weekDays.findIndex((d) => isSameDay(d, event.start));
		if (dayIndex === -1) continue;

		const start = Math.max(minMinutes, dayMinutes(event.start));
		const end = Math.min(maxMinutes, dayMinutes(event.end));
		if (end <= start) continue;

		accumulator.push({ dayIndex, startMinutes: start, endMinutes: end, event });
	}

	accumulator.sort((a, b) =>
		a.dayIndex !== b.dayIndex ? a.dayIndex - b.dayIndex : a.startMinutes - b.startMinutes
	);

	const columnsByDay = new Map<number, PositionedAccumulator[][]>();
	for (const item of accumulator) {
		const dayCols = columnsByDay.get(item.dayIndex) ?? [];
		let placed = false;
		for (let c = 0; c < dayCols.length; c++) {
			const col = dayCols[c]!;
			if (col.every((existing) => !overlaps(existing, item))) {
				col.push(item);
				positioned.push({
					event: item.event,
					dayIndex: item.dayIndex,
					startMinutes: item.startMinutes,
					endMinutes: item.endMinutes,
					column: c,
					columnCount: 0
				});
				placed = true;
				break;
			}
		}
		if (!placed) {
			dayCols.push([item]);
			positioned.push({
				event: item.event,
				dayIndex: item.dayIndex,
				startMinutes: item.startMinutes,
				endMinutes: item.endMinutes,
				column: dayCols.length - 1,
				columnCount: 0
			});
		}
		columnsByDay.set(item.dayIndex, dayCols);
	}

	for (const p of positioned) {
		const cols = columnsByDay.get(p.dayIndex);
		p.columnCount = cols ? cols.length : 1;
	}

	sortedBand.sort((a, b) => a.startDayIndex - b.startDayIndex);
	const rows: { startDayIndex: number; endDayIndex: number }[][] = [];
	for (const entry of sortedBand) {
		let placed = false;
		for (let r = 0; r < rows.length; r++) {
			const row = rows[r]!;
			if (
				row.every(
					(existing) =>
						entry.startDayIndex > existing.endDayIndex || entry.endDayIndex < existing.startDayIndex
				)
			) {
				row.push({ startDayIndex: entry.startDayIndex, endDayIndex: entry.endDayIndex });
				band.push({ ...entry, row: r });
				placed = true;
				break;
			}
		}
		if (!placed) {
			rows.push([{ startDayIndex: entry.startDayIndex, endDayIndex: entry.endDayIndex }]);
			band.push({ ...entry, row: rows.length - 1 });
		}
	}

	return { positioned, band };
}

export function formatTime(date: Date, locale: string): string {
	return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' })
		.format(date)
		.replace(/\s/g, ' ');
}

export function formatHourLabel(hour: number, locale: string): string {
	const date = new Date();
	date.setHours(hour, 0, 0, 0);
	return new Intl.DateTimeFormat(locale, { hour: 'numeric' }).format(date).replace(/\s/g, ' ');
}
