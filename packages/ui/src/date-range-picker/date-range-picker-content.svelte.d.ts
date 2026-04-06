import type { Snippet } from 'svelte';
import type { DateRangePickerContentProps } from './index.js';
interface Props extends DateRangePickerContentProps {
	children: Snippet;
}
declare const DateRangePickerContent: import('svelte').Component<Props, {}, ''>;
type DateRangePickerContent = ReturnType<typeof DateRangePickerContent>;
export default DateRangePickerContent;
