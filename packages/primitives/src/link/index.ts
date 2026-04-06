import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes } from 'svelte/elements';

export interface LinkProps extends HTMLAnchorAttributes {
	external?: boolean;
	disabled?: boolean;
	children: Snippet;
}

export { default as Link } from './link.svelte';
