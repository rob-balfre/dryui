import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children?: Snippet;
}
declare const CalendarHeader: import('svelte').Component<Props, {}, ''>;
type CalendarHeader = ReturnType<typeof CalendarHeader>;
export default CalendarHeader;
