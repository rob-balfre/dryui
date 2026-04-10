/**
 * Pure date math utilities — no Svelte, plain TypeScript.
 */
export declare function getDaysInMonth(year: number, month: number): number;
export declare function getFirstDayOfMonth(year: number, month: number): number;
export declare function getWeekStartDay(locale: string): number;
export declare function isSameDay(a: Date, b: Date): boolean;
export declare function isToday(date: Date): boolean;
export declare function isDateInRange(date: Date, min?: Date | null, max?: Date | null): boolean;
export declare function formatDate(date: Date, locale: string, options?: Intl.DateTimeFormatOptions): string;
/**
 * Returns an array of exactly 42 Date objects representing the 6-week calendar
 * grid for the given month. Days before and after the target month are padded
 * from adjacent months.
 */
export declare function getCalendarDays(year: number, month: number, weekStartDay: number): Date[];
export declare function addMonths(date: Date, n: number): Date;
export declare function addYears(date: Date, n: number): Date;
