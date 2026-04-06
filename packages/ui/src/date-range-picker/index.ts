export type {
	DateRangePickerRootProps,
	DateRangePickerTriggerProps,
	DateRangePickerContentProps,
	DateRangePickerCalendarProps,
	DateRangePickerPresetProps
} from '@dryui/primitives';

import DateRangePickerRoot from './date-range-picker-root.svelte';
import DateRangePickerTrigger from './date-range-picker-trigger.svelte';
import DateRangePickerContent from './date-range-picker-content.svelte';
import DateRangePickerCalendar from './date-range-picker-calendar.svelte';
import DateRangePickerPreset from './date-range-picker-preset.svelte';

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
