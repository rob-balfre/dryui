import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLButtonAttributes, 'children'> {
	placeholder?: string;
	children?: Snippet | undefined;
}
declare const DatepickerTrigger: import('svelte').Component<Props, {}, ''>;
type DatepickerTrigger = ReturnType<typeof DatepickerTrigger>;
export default DatepickerTrigger;
