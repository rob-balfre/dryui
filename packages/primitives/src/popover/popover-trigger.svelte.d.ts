import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const PopoverTrigger: import('svelte').Component<Props, {}, ''>;
type PopoverTrigger = ReturnType<typeof PopoverTrigger>;
export default PopoverTrigger;
