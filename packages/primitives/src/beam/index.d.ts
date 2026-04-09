import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BlendMode } from '../internal/blend-modes.js';
export type { BlendMode };
export interface BeamProps extends HTMLAttributes<HTMLDivElement> {
	color?: string;
	width?: number;
	angle?: number;
	speed?: number;
	intensity?: number;
	blendMode?: BlendMode;
	children?: Snippet;
}
export { default as Beam } from './beam.svelte';
