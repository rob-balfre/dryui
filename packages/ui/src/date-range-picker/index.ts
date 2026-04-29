import type { CalendarEventGridProps } from '../internal/calendar-event-layout.js';

export type {
	DateRangePickerRootProps,
	DateRangePickerTriggerProps,
	DateRangePickerContentProps,
	DateRangePickerPresetProps
} from '@dryui/primitives';

export interface DateRangePickerCalendarProps extends CalendarEventGridProps {}

import DateRangePickerRoot from './date-range-picker-root.svelte';
import DateRangePickerTrigger from './date-range-picker-button-trigger.svelte';
import DateRangePickerContent from './date-range-picker-content.svelte';
import DateRangePickerCalendar from './date-range-picker-button-calendar.svelte';
import DateRangePickerPreset from './date-range-picker-button-preset.svelte';

export const DateRangePicker: {
	Root: typeof DateRangePickerRoot;
	Trigger: typeof DateRangePickerTrigger;
	Content: typeof DateRangePickerContent;
	Calendar: typeof DateRangePickerCalendar;
	Preset: typeof DateRangePickerPreset;
} = {
	Root: DateRangePickerRoot,
	Trigger: DateRangePickerTrigger,
	Content: DateRangePickerContent,
	Calendar: DateRangePickerCalendar,
	Preset: DateRangePickerPreset
};
