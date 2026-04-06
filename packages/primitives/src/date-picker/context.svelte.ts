import { createContext } from '../utils/create-context.js';

export interface DatePickerContext {
	readonly open: boolean;
	readonly value: Date | null;
	readonly focusedDate: Date;
	readonly viewMonth: number; // 0-11
	readonly viewYear: number;
	readonly locale: string;
	readonly min: Date | null;
	readonly max: Date | null;
	readonly disabled: boolean;
	readonly weekStartDay: number;
	readonly triggerId: string;
	readonly contentId: string;
	triggerEl: HTMLElement | null;
	show: () => void;
	close: () => void;
	toggle: () => void;
	select: (date: Date) => void;
	goToMonth: (month: number) => void;
	goToYear: (year: number) => void;
	nextMonth: () => void;
	prevMonth: () => void;
	setFocusedDate: (date: Date) => void;
}
export const [setDatePickerCtx, getDatePickerCtx] = createContext<DatePickerContext>('date-picker');
