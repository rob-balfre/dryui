import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    padding?: boolean;
    children: Snippet;
}
export { default as Container } from './container.svelte';
