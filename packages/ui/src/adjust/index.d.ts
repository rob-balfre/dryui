import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BlendMode } from '@dryui/primitives/adjust';
export type { BlendMode };
export interface AdjustProps extends HTMLAttributes<HTMLDivElement> {
    brightness?: number;
    contrast?: number;
    saturate?: number;
    hueRotate?: number;
    grayscale?: number;
    sepia?: number;
    invert?: number;
    blur?: number;
    blendMode?: BlendMode;
    children: Snippet;
}
export { default as Adjust } from './adjust.svelte';
