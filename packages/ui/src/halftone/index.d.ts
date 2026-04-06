import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export type HalftoneDotSize = 'fine' | 'medium' | 'coarse' | number;
export interface HalftoneProps extends HTMLAttributes<HTMLDivElement> {
	dotSize?: HalftoneDotSize;
	angle?: number;
	color?: string;
	opacity?: number;
	children?: Snippet;
}
export { default as Halftone } from './halftone.svelte';
