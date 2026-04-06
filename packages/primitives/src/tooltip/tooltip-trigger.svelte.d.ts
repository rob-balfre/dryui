import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLSpanElement> {
	children: Snippet;
}
declare const TooltipTrigger: import('svelte').Component<Props, {}, ''>;
type TooltipTrigger = ReturnType<typeof TooltipTrigger>;
export default TooltipTrigger;
