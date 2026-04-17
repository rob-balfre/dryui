/* Headless export for external consumers; no UI wrapper by design. */
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
	background?: string;
	children: Snippet;
}

export { default as Surface } from './surface.svelte';
