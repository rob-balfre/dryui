import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
export interface DateRangePickerRootProps {
    open?: boolean;
    startDate?: Date | null;
    endDate?: Date | null;
    locale?: string;
    min?: Date | null;
    max?: Date | null;
    disabled?: boolean;
    children: Snippet;
}
export interface DateRangePickerTriggerProps extends Omit<HTMLButtonAttributes, 'children'> {
    placeholder?: string;
    children?: Snippet | undefined;
}
export interface DateRangePickerContentProps extends HTMLAttributes<HTMLDivElement> {
    placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end';
    offset?: number;
    children: Snippet;
}
export interface DateRangePickerCalendarProps extends HTMLAttributes<HTMLDivElement> {
}
export interface DateRangePickerPresetProps extends Omit<HTMLButtonAttributes, 'children'> {
    startDate: Date;
    endDate: Date;
    children: Snippet;
}
export { default as DateRangePickerRoot } from './date-range-picker-root.svelte';
export { default as DateRangePickerTrigger } from './date-range-picker-trigger.svelte';
export { default as DateRangePickerContent } from './date-range-picker-content.svelte';
export { default as DateRangePickerCalendar } from './date-range-picker-calendar.svelte';
export { default as DateRangePickerPreset } from './date-range-picker-preset.svelte';
import DateRangePickerRoot from './date-range-picker-root.svelte';
import DateRangePickerTrigger from './date-range-picker-trigger.svelte';
import DateRangePickerContent from './date-range-picker-content.svelte';
import DateRangePickerCalendar from './date-range-picker-calendar.svelte';
import DateRangePickerPreset from './date-range-picker-preset.svelte';
export declare const DateRangePicker: {
    Root: typeof DateRangePickerRoot;
    Trigger: typeof DateRangePickerTrigger;
    Content: typeof DateRangePickerContent;
    Calendar: typeof DateRangePickerCalendar;
    Preset: typeof DateRangePickerPreset;
};
