import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface StackProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
export { default as Stack } from './stack.svelte';
