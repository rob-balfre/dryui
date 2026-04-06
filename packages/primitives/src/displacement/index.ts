import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type DisplacementTurbulence = 'gentle' | 'medium' | 'rough';

export interface DisplacementProps extends HTMLAttributes<HTMLDivElement> {
	scale?: number;
	turbulence?: DisplacementTurbulence;
	animated?: boolean;
	children?: Snippet;
}

export { default as Displacement } from './displacement.svelte';
