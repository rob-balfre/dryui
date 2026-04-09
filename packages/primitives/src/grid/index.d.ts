import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface GridProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
export interface GridAreaProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
import GridRoot from './grid.svelte';
import GridArea from './grid-area.svelte';
export declare const Grid: typeof GridRoot & {
	Root: typeof GridRoot;
	Area: typeof GridArea;
};
