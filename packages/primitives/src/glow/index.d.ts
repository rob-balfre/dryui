import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BlendMode } from '../internal/blend-modes.js';
export type { BlendMode };
export interface GlowProps extends HTMLAttributes<HTMLDivElement> {
    color?: string;
    intensity?: number;
    radius?: number;
    blendMode?: BlendMode;
    children: Snippet;
}
export { default as Glow } from './glow.svelte';
