import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLElement> {
	as?: 'div' | 'a' | 'button';
	selected?: boolean;
	orientation?: 'vertical' | 'horizontal';
	variant?: 'default' | 'elevated' | 'interactive';
	size?: 'default' | 'sm';
	children: Snippet;
}
declare const CardRoot: import('svelte').Component<Props, {}, ''>;
type CardRoot = ReturnType<typeof CardRoot>;
export default CardRoot;
