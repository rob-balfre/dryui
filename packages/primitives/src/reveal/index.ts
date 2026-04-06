import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BlendMode } from '../internal/blend-modes.js';

export type { BlendMode };
export type RevealVariant = 'fade' | 'slide-up' | 'scale-in' | 'blur-up' | 'mask-up';

export interface RevealProps extends HTMLAttributes<HTMLDivElement> {
	variant?: RevealVariant;
	once?: boolean;
	threshold?: number;
	delay?: number;
	duration?: number;
	distance?: number | string;
	blendMode?: BlendMode;
	children: Snippet;
}

export { default as Reveal } from './reveal.svelte';
