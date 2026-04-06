import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export type NoiseBlendMode = 'soft-light' | 'overlay' | 'multiply';
export type NoiseGrain = 'fine' | 'medium' | 'coarse';
export interface NoiseProps extends HTMLAttributes<HTMLDivElement> {
	opacity?: number;
	blend?: NoiseBlendMode;
	animated?: boolean;
	grain?: NoiseGrain;
	children?: Snippet;
}
export { default as Noise } from './noise.svelte';
