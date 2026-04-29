import { describe, expect, it } from 'vitest';
import {
	layoutCalendarEvents,
	type CalendarEventDayLayout,
	type CalendarEventItem
} from '../../packages/ui/src/internal/calendar-event-layout';

function daysFrom(start: Date, count: number): Date[] {
	return Array.from({ length: count }, (_, index) => {
		const date = new Date(start);
		date.setDate(date.getDate() + index);
		return date;
	});
}

function getDay(
	layout: Map<string, CalendarEventDayLayout>,
	isoDate: string
): CalendarEventDayLayout {
	const day = layout.get(isoDate);
	if (!day) throw new Error(`Expected day ${isoDate}`);
	return day;
}

function event(overrides: Partial<CalendarEventItem>): CalendarEventItem {
	return {
		id: 'event',
		title: 'Event',
		start: new Date(2026, 3, 1),
		...overrides
	};
}

describe('layoutCalendarEvents', () => {
	it('places a single-day event on the matching day', () => {
		const layout = layoutCalendarEvents({
			days: daysFrom(new Date(2026, 3, 1), 7),
			events: [event({ id: 'flight', title: 'Flight to Paris', start: new Date(2026, 3, 2) })]
		});

		const day = getDay(layout, '2026-04-02');
		expect(day.summary).toBe('1 event: Flight to Paris');
		expect(day.piecesByLane[0]?.event.id).toBe('flight');
		expect(day.piecesByLane[0]?.position).toBe('single');
		expect(getDay(layout, '2026-04-03').events).toHaveLength(0);
	});

	it('keeps a multi-day event in the same lane across a week boundary', () => {
		const layout = layoutCalendarEvents({
			days: daysFrom(new Date(2026, 3, 1), 14),
			events: [
				event({
					id: 'hotel',
					title: 'Hotel stay',
					start: new Date(2026, 3, 4),
					end: new Date(2026, 3, 8)
				})
			]
		});

		expect(getDay(layout, '2026-04-04').piecesByLane[0]?.position).toBe('start');
		expect(getDay(layout, '2026-04-05').piecesByLane[0]?.position).toBe('middle');
		expect(getDay(layout, '2026-04-08').piecesByLane[0]?.position).toBe('end');
		expect(getDay(layout, '2026-04-08').piecesByLane[0]?.lane).toBe(0);
	});

	it('clips events to the visible calendar days while preserving continuation state', () => {
		const layout = layoutCalendarEvents({
			days: daysFrom(new Date(2026, 3, 1), 7),
			events: [
				event({
					id: 'rental',
					title: 'Rental car',
					start: new Date(2026, 2, 30),
					end: new Date(2026, 3, 2)
				})
			]
		});

		expect(getDay(layout, '2026-04-01').piecesByLane[0]?.position).toBe('middle');
		expect(getDay(layout, '2026-04-02').piecesByLane[0]?.position).toBe('end');
		expect(getDay(layout, '2026-04-03').events).toHaveLength(0);
	});

	it('uses priority and lane limits to produce deterministic overflow', () => {
		const layout = layoutCalendarEvents({
			days: daysFrom(new Date(2026, 3, 1), 7),
			maxEventLanes: 2,
			events: [
				event({
					id: 'hotel',
					title: 'Hotel stay',
					start: new Date(2026, 3, 1),
					end: new Date(2026, 3, 5)
				}),
				event({
					id: 'flight',
					title: 'Flight to Paris',
					start: new Date(2026, 3, 2),
					priority: 10
				}),
				event({ id: 'tour', title: 'City tour', start: new Date(2026, 3, 2) })
			]
		});

		const april2 = getDay(layout, '2026-04-02');
		expect(april2.piecesByLane[0]?.event.id).toBe('flight');
		expect(april2.piecesByLane[1]?.event.id).toBe('hotel');
		expect(april2.overflowCount).toBe(1);
		expect(april2.summary).toBe('3 events: Flight to Paris, Hotel stay, City tour');
	});

	it('moves all visible events into overflow when maxEventLanes is zero', () => {
		const layout = layoutCalendarEvents({
			days: daysFrom(new Date(2026, 3, 1), 7),
			maxEventLanes: 0,
			events: [
				event({ id: 'flight', title: 'Flight to Paris', start: new Date(2026, 3, 2) }),
				event({ id: 'hotel', title: 'Hotel stay', start: new Date(2026, 3, 2) })
			]
		});

		const april2 = getDay(layout, '2026-04-02');
		expect(april2.piecesByLane).toHaveLength(0);
		expect(april2.overflowCount).toBe(2);
		expect(april2.summary).toBe('2 events: Flight to Paris, Hotel stay');
	});

	it('ignores events with invalid dates', () => {
		const layout = layoutCalendarEvents({
			days: daysFrom(new Date(2026, 3, 1), 7),
			events: [event({ id: 'invalid', start: new Date('not a date') })]
		});

		expect(getDay(layout, '2026-04-01').events).toHaveLength(0);
	});
});
