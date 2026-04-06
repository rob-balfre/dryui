import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
	ratio?: number;
	children: Snippet;
}

export { default as AspectRatio } from './aspect-ratio.svelte';
