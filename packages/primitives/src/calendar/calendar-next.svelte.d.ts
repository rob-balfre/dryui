import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	children?: Snippet;
}
declare const CalendarNext: import('svelte').Component<Props, {}, ''>;
type CalendarNext = ReturnType<typeof CalendarNext>;
export default CalendarNext;
