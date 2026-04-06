import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface ImageComparisonProps extends HTMLAttributes<HTMLDivElement> {
	position?: number;
	orientation?: 'horizontal' | 'vertical';
	before: Snippet;
	after: Snippet;
	handle?: Snippet;
}

export { default as ImageComparison } from './image-comparison.svelte';
