import { createContext } from '../utils/create-context.js';

export interface CalendarContext {
	readonly value: Date | null;
	readonly focusedDate: Date;
	readonly viewMonth: number; // 0-11
	readonly viewYear: number;
	readonly locale: string;
	readonly min: Date | null;
	readonly max: Date | null;
	readonly disabled: boolean;
	readonly weekStartDay: number;
	readonly multiple: boolean;
	readonly selectedDates: Date[];
	select: (date: Date) => void;
	goToMonth: (month: number) => void;
	goToYear: (year: number) => void;
	nextMonth: () => void;
	prevMonth: () => void;
	setFocusedDate: (date: Date) => void;
}
export const [setCalendarCtx, getCalendarCtx] = createContext<CalendarContext>('calendar');
