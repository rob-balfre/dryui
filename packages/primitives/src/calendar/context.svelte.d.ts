export interface CalendarContext {
	readonly value: Date | null;
	readonly focusedDate: Date;
	readonly viewMonth: number;
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
export declare function setCalendarCtx(ctx: CalendarContext): CalendarContext;
export declare function getCalendarCtx(): CalendarContext;
