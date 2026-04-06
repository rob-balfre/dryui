import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	trigger?: 'hover' | 'click';
	direction?: 'horizontal' | 'vertical';
	flipped?: boolean;
	children: Snippet;
}
declare const FlipCardRoot: import('svelte').Component<Props, {}, 'flipped'>;
type FlipCardRoot = ReturnType<typeof FlipCardRoot>;
export default FlipCardRoot;
