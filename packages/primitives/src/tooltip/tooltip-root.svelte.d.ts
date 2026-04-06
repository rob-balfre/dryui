import type { Snippet } from 'svelte';
interface Props {
	openDelay?: number;
	closeDelay?: number;
	children: Snippet;
}
declare const TooltipRoot: import('svelte').Component<Props, {}, ''>;
type TooltipRoot = ReturnType<typeof TooltipRoot>;
export default TooltipRoot;
