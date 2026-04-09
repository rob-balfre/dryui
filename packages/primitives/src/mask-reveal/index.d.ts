import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export type MaskRevealShape = 'circle' | 'linear' | 'diagonal' | 'diamond';
export type MaskRevealDirection = 'in' | 'out';
export interface MaskRevealProps extends HTMLAttributes<HTMLDivElement> {
	shape?: MaskRevealShape;
	direction?: 'in' | 'out';
	once?: boolean;
	threshold?: number;
	duration?: number;
	children?: Snippet;
}
export { default as MaskReveal } from './mask-reveal.svelte';
