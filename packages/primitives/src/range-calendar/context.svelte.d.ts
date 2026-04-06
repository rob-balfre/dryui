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
export declare function setRangeCalendarCtx(ctx: RangeCalendarContext): RangeCalendarContext;
export declare function getRangeCalendarCtx(): RangeCalendarContext;
