/* Headless export for external consumers; no UI wrapper by design. */
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type SurfaceElement = 'div' | 'span' | 'header' | 'nav' | 'main' | 'footer' | 'section';

export interface SurfaceProps extends HTMLAttributes<HTMLElement> {
	as?: SurfaceElement;
	background?: string;
	className?: HTMLAttributes<HTMLElement>['class'];
	children?: Snippet;
}

export { default as Surface } from './surface.svelte';
