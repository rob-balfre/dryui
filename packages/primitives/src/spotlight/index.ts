import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BlendMode } from '../internal/blend-modes.js';

export type { BlendMode };

export interface SpotlightProps extends HTMLAttributes<HTMLDivElement> {
	radius?: number;
	intensity?: number;
	color?: string;
	followPointer?: boolean;
	blendMode?: BlendMode;
	children: Snippet;
}

export { default as Spotlight } from './spotlight.svelte';
