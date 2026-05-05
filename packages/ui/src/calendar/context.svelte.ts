import { createContext } from '@dryui/primitives';
import type { CalendarVisibleMonths } from '../internal/calendar-event-layout.js';
import type { CalendarEvent, CalendarEventCategory, CalendarView } from './types.js';

export interface CalendarMonthViewState {
	visibleMonths: CalendarVisibleMonths;
}

export interface CalendarContext {
	readonly value: Date | null;
	readonly focusedDate: Date;
	readonly viewMonth: number;
	readonly viewYear: number;
	readonly locale: string;
	readonly visibleMonths: CalendarVisibleMonths;
	readonly monthView: CalendarMonthViewState;
	readonly min: Date | null;
	readonly max: Date | null;
	readonly disabled: boolean;
	readonly weekStartDay: number;
	readonly multiple: boolean;
	readonly selectedDates: Date[];
	readonly view: CalendarView;
	readonly events: CalendarEvent[];
	readonly categories: CalendarEventCategory[];
	readonly selectedEvent: CalendarEvent | null;
	readonly weekStartHour: number;
	readonly weekEndHour: number;
	readonly weekTimeZoneLabel: string;
	select: (date: Date) => void;
	selectEvent: (event: CalendarEvent | null) => void;
	goToMonth: (month: number) => void;
	goToYear: (year: number) => void;
	nextMonth: () => void;
	prevMonth: () => void;
	nextWeek: () => void;
	prevWeek: () => void;
	goToToday: () => void;
	setFocusedDate: (date: Date) => void;
	getCategory: (id: string | undefined) => CalendarEventCategory | undefined;
}

export const [setCalendarCtx, getCalendarCtx] = createContext<CalendarContext>('calendar');
