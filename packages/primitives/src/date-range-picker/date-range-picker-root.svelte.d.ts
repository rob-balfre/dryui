import type { Snippet } from 'svelte';
interface Props {
	open?: boolean;
	startDate?: Date | null;
	endDate?: Date | null;
	locale?: string;
	min?: Date | null;
	max?: Date | null;
	disabled?: boolean;
	children: Snippet;
}
declare const DateRangePickerRoot: import('svelte').Component<
	Props,
	{},
	'startDate' | 'endDate' | 'open'
>;
type DateRangePickerRoot = ReturnType<typeof DateRangePickerRoot>;
export default DateRangePickerRoot;
