import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BlendMode } from '@dryui/primitives/god-rays';

export type { BlendMode };

export interface GodRaysProps extends HTMLAttributes<HTMLDivElement> {
	color?: string;
	rayCount?: number;
	intensity?: number;
	center?: { x: number; y: number };
	speed?: number;
	blendMode?: BlendMode;
	children?: Snippet;
}

export { default as GodRays } from './god-rays.svelte';
