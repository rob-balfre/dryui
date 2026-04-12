import type { DatePickerTriggerProps as PrimitiveDatePickerTriggerProps } from '@dryui/primitives';

export type {
	DatePickerRootProps,
	DatePickerContentProps,
	DatePickerCalendarProps
} from '@dryui/primitives';

export interface DatePickerTriggerProps extends PrimitiveDatePickerTriggerProps {
	size?: 'sm' | 'md' | 'lg';
}

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
