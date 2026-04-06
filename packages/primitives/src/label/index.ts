import type { Snippet } from 'svelte';
import type { HTMLLabelAttributes } from 'svelte/elements';

export interface LabelProps extends HTMLLabelAttributes {
	children: Snippet;
}

export { default as Label } from './label.svelte';
