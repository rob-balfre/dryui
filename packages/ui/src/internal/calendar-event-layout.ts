import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type CalendarEventTone = 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'danger';

export type CalendarEventDisplay = 'dots' | 'bars';

export type CalendarEventPosition = 'single' | 'start' | 'middle' | 'end';

export interface CalendarEventItem {
	id: string;
	title: string;
	start: Date;
	end?: Date | null;
	kind?: string;
	tone?: CalendarEventTone;
	priority?: number;
	ariaLabel?: string;
}

export interface CalendarEventPiece {
	event: CalendarEventItem;
	date: Date;
	isoDate: string;
	lane: number;
	position: CalendarEventPosition;
}

export interface CalendarEventRenderContext {
	event: CalendarEventItem;
	date: Date;
	isoDate: string;
	display: CalendarEventDisplay;
	position: CalendarEventPosition;
	lane: number;
}

export interface CalendarEventDayLayout {
	date: Date;
	isoDate: string;
	events: CalendarEventItem[];
	piecesByLane: Array<CalendarEventPiece | null>;
	overflowCount: number;
	summary: string;
}

export interface CalendarEventGridProps extends HTMLAttributes<HTMLDivElement> {
	events?: readonly CalendarEventItem[];
	eventDisplay?: CalendarEventDisplay;
	maxEventLanes?: number;
	eventContent?: Snippet<[CalendarEventRenderContext]>;
}

interface NormalizedEvent {
	event: CalendarEventItem;
	start: Date;
	end: Date;
	startTime: number;
	endTime: number;
	duration: number;
	index: number;
}

interface VisibleEvent extends NormalizedEvent {
	visibleDates: Date[];
	visibleIsoDates: string[];
}

export function getCalendarEventDayId(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function layoutCalendarEvents(options: {
	days: readonly Date[];
	events?: readonly CalendarEventItem[];
	maxEventLanes?: number;
}): Map<string, CalendarEventDayLayout> {
	const lanes = normalizeLaneCount(options.maxEventLanes);
	const layout = createEmptyLayout(options.days, lanes);
	const firstDay = options.days[0] ? startOfLocalDay(options.days[0]) : null;
	const lastDay = options.days.at(-1) ? startOfLocalDay(options.days.at(-1) as Date) : null;

	if (!firstDay || !lastDay || !options.events?.length) return layout;

	const visibleEvents = options.events
		.map((event, index) => normalizeEvent(event, index))
		.filter((event): event is NormalizedEvent => event !== null)
		.map((event) => getVisibleEvent(event, firstDay, lastDay))
		.filter((event): event is VisibleEvent => event !== null)
		.sort(compareVisibleEvents);

	const occupied = Array.from({ length: lanes }, () => new Set<string>());

	for (const visibleEvent of visibleEvents) {
		for (const isoDate of visibleEvent.visibleIsoDates) {
			layout.get(isoDate)?.events.push(visibleEvent.event);
		}
	}

	for (const visibleEvent of visibleEvents) {
		const lane = findAvailableLane(visibleEvent.visibleIsoDates, occupied);

		if (lane === -1) {
			for (const isoDate of visibleEvent.visibleIsoDates) {
				const dayLayout = layout.get(isoDate);
				if (dayLayout) dayLayout.overflowCount += 1;
			}
			continue;
		}

		for (const isoDate of visibleEvent.visibleIsoDates) {
			occupied[lane]?.add(isoDate);
		}

		for (const date of visibleEvent.visibleDates) {
			const isoDate = getCalendarEventDayId(date);
			const dayLayout = layout.get(isoDate);
			if (!dayLayout) continue;

			dayLayout.piecesByLane[lane] = {
				event: visibleEvent.event,
				date,
				isoDate,
				lane,
				position: getEventPosition(date, visibleEvent.start, visibleEvent.end)
			};
		}
	}

	for (const dayLayout of layout.values()) {
		dayLayout.events.sort((a, b) => compareEvents(a, b));
		dayLayout.summary = formatCalendarEventSummary(dayLayout.events);
	}

	return layout;
}

export function formatCalendarEventSummary(events: readonly CalendarEventItem[]): string {
	if (events.length === 0) return '';

	const labels = events.slice(0, 3).map((event) => event.ariaLabel ?? event.title);
	const remaining = events.length - labels.length;
	const suffix = remaining > 0 ? `, and ${remaining} more` : '';
	const noun = events.length === 1 ? 'event' : 'events';

	return `${events.length} ${noun}: ${labels.join(', ')}${suffix}`;
}

function createEmptyLayout(
	days: readonly Date[],
	lanes: number
): Map<string, CalendarEventDayLayout> {
	const layout = new Map<string, CalendarEventDayLayout>();

	for (const day of days) {
		const date = startOfLocalDay(day);
		const isoDate = getCalendarEventDayId(date);
		layout.set(isoDate, {
			date,
			isoDate,
			events: [],
			piecesByLane: Array.from({ length: lanes }, () => null),
			overflowCount: 0,
			summary: ''
		});
	}

	return layout;
}

function normalizeLaneCount(value: number | undefined): number {
	if (value == null) return 3;
	if (!Number.isFinite(value)) return 3;
	return Math.max(0, Math.floor(value));
}

function normalizeEvent(event: CalendarEventItem, index: number): NormalizedEvent | null {
	if (!event.id || !event.title) return null;

	const start = startOfLocalDay(event.start);
	const end = startOfLocalDay(event.end ?? event.start);

	if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

	const orderedStart = start.getTime() <= end.getTime() ? start : end;
	const orderedEnd = start.getTime() <= end.getTime() ? end : start;
	const startTime = orderedStart.getTime();
	const endTime = orderedEnd.getTime();

	return {
		event,
		start: orderedStart,
		end: orderedEnd,
		startTime,
		endTime,
		duration: dayDiff(orderedStart, orderedEnd) + 1,
		index
	};
}

function getVisibleEvent(
	event: NormalizedEvent,
	firstDay: Date,
	lastDay: Date
): VisibleEvent | null {
	if (event.endTime < firstDay.getTime()) return null;
	if (event.startTime > lastDay.getTime()) return null;

	const visibleStart = event.startTime < firstDay.getTime() ? firstDay : event.start;
	const visibleEnd = event.endTime > lastDay.getTime() ? lastDay : event.end;
	const visibleDates = enumerateDays(visibleStart, visibleEnd);

	return {
		...event,
		visibleDates,
		visibleIsoDates: visibleDates.map((date) => getCalendarEventDayId(date))
	};
}

function compareVisibleEvents(a: VisibleEvent, b: VisibleEvent): number {
	return compareNormalizedEvents(a, b);
}

function compareEvents(a: CalendarEventItem, b: CalendarEventItem): number {
	return compareNormalizedEvents(normalizeEvent(a, 0), normalizeEvent(b, 0));
}

function compareNormalizedEvents(a: NormalizedEvent | null, b: NormalizedEvent | null): number {
	if (!a && !b) return 0;
	if (!a) return 1;
	if (!b) return -1;

	const priority = (b.event.priority ?? 0) - (a.event.priority ?? 0);
	if (priority !== 0) return priority;

	const duration = b.duration - a.duration;
	if (duration !== 0) return duration;

	const start = a.startTime - b.startTime;
	if (start !== 0) return start;

	const title = a.event.title.localeCompare(b.event.title);
	if (title !== 0) return title;

	const id = a.event.id.localeCompare(b.event.id);
	if (id !== 0) return id;

	return a.index - b.index;
}

function findAvailableLane(isoDates: readonly string[], occupied: Array<Set<string>>): number {
	for (let lane = 0; lane < occupied.length; lane += 1) {
		const occupiedDates = occupied[lane];
		if (!occupiedDates) continue;
		if (isoDates.every((isoDate) => !occupiedDates.has(isoDate))) return lane;
	}

	return -1;
}

function getEventPosition(date: Date, start: Date, end: Date): CalendarEventPosition {
	const time = date.getTime();
	if (start.getTime() === end.getTime()) return 'single';
	if (time === start.getTime()) return 'start';
	if (time === end.getTime()) return 'end';
	return 'middle';
}

function enumerateDays(start: Date, end: Date): Date[] {
	const days: Date[] = [];
	const cursor = startOfLocalDay(start);
	const last = end.getTime();

	while (cursor.getTime() <= last) {
		days.push(new Date(cursor));
		cursor.setDate(cursor.getDate() + 1);
	}

	return days;
}

function startOfLocalDay(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayDiff(start: Date, end: Date): number {
	return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}
