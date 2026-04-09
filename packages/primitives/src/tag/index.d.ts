import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
	children: Snippet;
	dismissible?: boolean;
	onDismiss?: () => void;
}
export { default as Tag } from './tag.svelte';
