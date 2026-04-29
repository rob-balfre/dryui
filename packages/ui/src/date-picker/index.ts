import type { DatePickerTriggerProps as PrimitiveDatePickerTriggerProps } from '@dryui/primitives';
import type { CalendarEventGridProps } from '../internal/calendar-event-layout.js';

export type { DatePickerRootProps, DatePickerContentProps } from '@dryui/primitives';

export interface DatePickerTriggerProps extends PrimitiveDatePickerTriggerProps {
	size?: 'sm' | 'md' | 'lg';
}

export interface DatePickerCalendarProps extends CalendarEventGridProps {}

import DatePickerRoot from './datepicker-input-root.svelte';
import DatePickerTrigger from './datepicker-button-trigger.svelte';
import DatePickerContent from './datepicker-content.svelte';
import DatePickerCalendar from './datepicker-button-calendar.svelte';

export const DatePicker: {
	Root: typeof DatePickerRoot;
	Trigger: typeof DatePickerTrigger;
	Content: typeof DatePickerContent;
	Calendar: typeof DatePickerCalendar;
} = {
	Root: DatePickerRoot,
	Trigger: DatePickerTrigger,
	Content: DatePickerContent,
	Calendar: DatePickerCalendar
};
