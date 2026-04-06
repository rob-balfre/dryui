import { createContext } from '../utils/create-context.js';

export interface RangeCalendarContext {
	readonly startDate: Date | null;
	readonly endDate: Date | null;
	readonly hoveredDate: Date | null;
	readonly focusedDate: Date;
	readonly viewMonth: number;
	readonly viewYear: number;
	readonly locale: string;
	readonly min: Date | null;
	readonly max: Date | null;
	readonly disabled: boolean;
	readonly weekStartDay: number;
	selectDate: (date: Date) => void;
	setHoveredDate: (date: Date | null) => void;
	nextMonth: () => void;
	prevMonth: () => void;
	setFocusedDate: (date: Date) => void;
}
export const [setRangeCalendarCtx, getRangeCalendarCtx] =
	createContext<RangeCalendarContext>('range-calendar');
