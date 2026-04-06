import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BlendMode } from '../internal/blend-modes.js';

export type { BlendMode };

export type AuroraNamedPalette = 'sunrise' | 'ocean' | 'forest' | 'cosmic';
export type AuroraPalette = AuroraNamedPalette | readonly [string, string, string];
export type AuroraSpeed = 'slow' | 'normal' | 'fast' | number;
export type AuroraColorSpace = 'srgb' | 'oklch' | 'oklab';
export interface AuroraProps extends HTMLAttributes<HTMLDivElement> {
	palette?: AuroraPalette;
	speed?: AuroraSpeed;
	intensity?: number;
	waviness?: number;
	colorSpace?: AuroraColorSpace;
	blendMode?: BlendMode;
	layerOpacity?: number;
	children?: Snippet;
}

export { default as Aurora } from './aurora.svelte';
