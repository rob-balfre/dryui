import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
type BadgeColor =
	| 'gray'
	| 'blue'
	| 'red'
	| 'green'
	| 'yellow'
	| 'purple'
	| 'orange'
	| 'info'
	| 'success'
	| 'warning'
	| 'danger';
interface Props extends HTMLAttributes<HTMLSpanElement> {
	variant?: 'solid' | 'outline' | 'soft' | 'dot';
	color?: BadgeColor;
	size?: 'sm' | 'md';
	children?: Snippet;
	pulse?: boolean;
	icon?: Snippet;
}
declare const Badge: import('svelte').Component<Props, {}, ''>;
type Badge = ReturnType<typeof Badge>;
export default Badge;
