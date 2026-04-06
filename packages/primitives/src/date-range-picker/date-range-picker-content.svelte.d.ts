import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end';
	offset?: number;
	children: Snippet;
}
declare const DateRangePickerContent: import('svelte').Component<Props, {}, ''>;
type DateRangePickerContent = ReturnType<typeof DateRangePickerContent>;
export default DateRangePickerContent;
