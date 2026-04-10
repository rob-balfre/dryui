import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { Placement } from '../utils/anchor-position.svelte.js';
export interface DatePickerRootProps {
    open?: boolean;
    value?: Date | null;
    name?: string;
    locale?: string;
    min?: Date | null;
    max?: Date | null;
    disabled?: boolean;
    children: Snippet;
}
export interface DatePickerTriggerProps extends Omit<HTMLButtonAttributes, 'children'> {
    placeholder?: string;
    children?: Snippet | undefined;
}
export interface DatePickerContentProps extends HTMLAttributes<HTMLDivElement> {
    placement?: Placement;
    offset?: number;
    children: Snippet;
}
export interface DatePickerCalendarProps extends HTMLAttributes<HTMLDivElement> {
}
export { default as DatePickerRoot } from './datepicker-root.svelte';
export { default as DatePickerTrigger } from './datepicker-trigger.svelte';
export { default as DatePickerContent } from './datepicker-content.svelte';
export { default as DatePickerCalendar } from './datepicker-calendar.svelte';
import DatePickerRoot from './datepicker-root.svelte';
import DatePickerTrigger from './datepicker-trigger.svelte';
import DatePickerContent from './datepicker-content.svelte';
import DatePickerCalendar from './datepicker-calendar.svelte';
export declare const DatePicker: {
    Root: typeof DatePickerRoot;
    Trigger: typeof DatePickerTrigger;
    Content: typeof DatePickerContent;
    Calendar: typeof DatePickerCalendar;
};
