import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {
    children: Snippet;
}
export { default as VisuallyHidden } from './visually-hidden.svelte';
