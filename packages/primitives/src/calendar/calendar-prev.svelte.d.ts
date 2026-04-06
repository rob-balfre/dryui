import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	children?: Snippet;
}
declare const CalendarPrev: import('svelte').Component<Props, {}, ''>;
type CalendarPrev = ReturnType<typeof CalendarPrev>;
export default CalendarPrev;
