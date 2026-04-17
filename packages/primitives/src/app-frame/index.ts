/* Headless export for external consumers; no UI wrapper by design. */
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface AppFrameProps extends HTMLAttributes<HTMLDivElement> {
	title?: string;
	actions?: Snippet;
	children: Snippet;
}

export { default as AppFrame } from './app-frame.svelte';
