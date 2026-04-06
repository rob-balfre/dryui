import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export { default as Container } from './container.svelte';
