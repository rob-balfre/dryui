import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface GlassProps extends HTMLAttributes<HTMLDivElement> {
	blur?: number;
	tint?: string;
	saturation?: number;
	children: Snippet;
}

export { default as Glass } from './glass.svelte';
