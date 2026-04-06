import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
    background?: string;
    children: Snippet;
}
export { default as Surface } from './surface.svelte';
