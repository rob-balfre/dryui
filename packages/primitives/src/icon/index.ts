import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface IconProps extends HTMLAttributes<HTMLSpanElement> {
	label?: string;
	children: Snippet;
}

export { default as Icon } from './icon.svelte';
