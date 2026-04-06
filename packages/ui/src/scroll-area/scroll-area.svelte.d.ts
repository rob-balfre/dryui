import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	orientation?: 'vertical' | 'horizontal' | 'both';
	children: Snippet;
}
declare const ScrollArea: import('svelte').Component<Props, {}, ''>;
type ScrollArea = ReturnType<typeof ScrollArea>;
export default ScrollArea;
