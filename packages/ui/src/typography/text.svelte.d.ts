import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLElement> {
	as?: 'p' | 'span' | 'div';
	color?: 'default' | 'muted' | 'secondary';
	variant?: 'default' | 'muted' | 'secondary';
	size?: 'sm' | 'md' | 'lg';
	children: Snippet;
}
declare const Text: import('svelte').Component<Props, {}, ''>;
type Text = ReturnType<typeof Text>;
export default Text;
