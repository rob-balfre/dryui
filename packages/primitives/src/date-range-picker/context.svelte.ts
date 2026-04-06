import { createContext } from '../utils/create-context.js';

export interface DateRangePickerContext {
	readonly open: boolean;
	readonly startDate: Date | null;
	readonly endDate: Date | null;
	readonly focusedDate: Date;
	readonly viewMonth: number; // 0-11
	readonly viewYear: number;
	readonly locale: string;
	readonly min: Date | null;
	readonly max: Date | null;
	readonly disabled: boolean;
	readonly weekStartDay: number;
	readonly hoverDate: Date | null;
	readonly selecting: 'start' | 'end';
	readonly triggerId: string;
	readonly contentId: string;
	triggerEl: HTMLElement | null;
	show: () => void;
	close: () => void;
	toggle: () => void;
	selectDate: (date: Date) => void;
	setHoverDate: (date: Date | null) => void;
	nextMonth: () => void;
	prevMonth: () => void;
	setFocusedDate: (date: Date) => void;
}
export const [setDateRangePickerCtx, getDateRangePickerCtx] =
	createContext<DateRangePickerContext>('date-range-picker');
