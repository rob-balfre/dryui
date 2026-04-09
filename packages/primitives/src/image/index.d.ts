import type { Snippet } from 'svelte';
import type { HTMLImgAttributes } from 'svelte/elements';
export interface ImageProps extends HTMLImgAttributes {
	fallback?: string;
	fallbackSnippet?: Snippet;
}
export { default as Image } from './image.svelte';
