import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLButtonAttributes, 'children'> {
	placeholder?: string;
	children?: Snippet | undefined;
}
declare const DateRangePickerTrigger: import('svelte').Component<Props, {}, ''>;
type DateRangePickerTrigger = ReturnType<typeof DateRangePickerTrigger>;
export default DateRangePickerTrigger;
