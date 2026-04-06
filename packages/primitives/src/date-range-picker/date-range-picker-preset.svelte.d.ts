import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLButtonAttributes, 'children'> {
	startDate: Date;
	endDate: Date;
	children: Snippet;
}
declare const DateRangePickerPreset: import('svelte').Component<Props, {}, ''>;
type DateRangePickerPreset = ReturnType<typeof DateRangePickerPreset>;
export default DateRangePickerPreset;
