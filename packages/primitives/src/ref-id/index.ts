import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface RefIdProps extends HTMLAttributes<HTMLSpanElement> {
	children: Snippet;
	prefix?: string;
}

export { default as RefId } from './ref-id.svelte';
