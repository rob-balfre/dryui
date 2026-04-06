import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';

export interface ButtonProps extends HTMLButtonAttributes {
	disabled?: boolean;
	href?: string;
	rel?: string;
	target?: string;
	download?: boolean | string;
	type?: 'button' | 'submit' | 'reset';
	children: Snippet;
}

export { default as Button } from './button.svelte';
