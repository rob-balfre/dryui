import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface KbdProps extends HTMLAttributes<HTMLElement> {
	keys?: string[];
	children?: Snippet;
}
export { default as Kbd } from './kbd.svelte';
