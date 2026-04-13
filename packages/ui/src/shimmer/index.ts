import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface ShimmerProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	color?: string;
	duration?: number;
	children: Snippet;
}

export { default as Shimmer } from './shimmer.svelte';
