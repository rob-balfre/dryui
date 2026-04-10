import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
    orientation?: 'vertical' | 'horizontal' | 'both';
    children: Snippet;
}
export { default as ScrollArea } from './scroll-area.svelte';
