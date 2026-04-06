import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface RangeCalendarRootProps extends HTMLAttributes<HTMLDivElement> {
    startDate?: Date | null;
    endDate?: Date | null;
    locale?: string;
    min?: Date | null;
    max?: Date | null;
    disabled?: boolean;
    children: Snippet;
}
export interface RangeCalendarGridProps extends HTMLAttributes<HTMLDivElement> {
}
import RangeCalendarRoot from './range-calendar-root.svelte';
import RangeCalendarGrid from './range-calendar-grid.svelte';
export declare const RangeCalendar: {
    Root: typeof RangeCalendarRoot;
    Grid: typeof RangeCalendarGrid;
};
