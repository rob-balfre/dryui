import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	size?: 'sm' | 'md' | 'lg';
	placeholder?: string;
	children?: Snippet;
}
declare const DatepickerTrigger: import('svelte').Component<Props, {}, ''>;
type DatepickerTrigger = ReturnType<typeof DatepickerTrigger>;
export default DatepickerTrigger;
