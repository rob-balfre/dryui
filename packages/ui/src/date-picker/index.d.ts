import type { DatePickerTriggerProps as PrimitiveDatePickerTriggerProps } from '@dryui/primitives';
export type {
	DatePickerRootProps,
	DatePickerContentProps,
	DatePickerCalendarProps
} from '@dryui/primitives';
export interface DatePickerTriggerProps extends PrimitiveDatePickerTriggerProps {
	size?: 'sm' | 'md' | 'lg';
}
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
