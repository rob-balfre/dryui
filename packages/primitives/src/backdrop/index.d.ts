import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface BackdropProps extends HTMLAttributes<HTMLDivElement> {
	open?: boolean;
	invisible?: boolean;
	children?: Snippet;
}
export { default as Backdrop } from './backdrop.svelte';
