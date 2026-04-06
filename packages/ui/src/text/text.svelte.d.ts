import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLElement> {
	as?: 'p' | 'span' | 'div';
	color?: 'default' | 'muted' | 'secondary';
	size?: 'xs' | 'sm' | 'md' | 'lg';
	font?: 'sans' | 'mono';
	weight?: 'normal' | 'medium' | 'semibold' | 'bold';
	variant?: 'default' | 'label';
	children: Snippet;
}
declare const Text: import('svelte').Component<Props, {}, ''>;
type Text = ReturnType<typeof Text>;
export default Text;
