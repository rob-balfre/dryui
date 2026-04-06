import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLSpanElement> {
	children: Snippet;
	dismissible?: boolean;
	onDismiss?: () => void;
}
declare const Tag: import('svelte').Component<Props, {}, ''>;
type Tag = ReturnType<typeof Tag>;
export default Tag;
