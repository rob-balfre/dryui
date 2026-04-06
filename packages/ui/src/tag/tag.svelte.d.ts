import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
type TagColor =
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
	variant?: 'solid' | 'outline' | 'soft';
	color?: TagColor;
	size?: 'sm' | 'md';
	dismissible?: boolean;
	onDismiss?: () => void;
	children: Snippet;
}
declare const Tag: import('svelte').Component<Props, {}, ''>;
type Tag = ReturnType<typeof Tag>;
export default Tag;
