import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
    orientation?: 'horizontal' | 'vertical';
    children: Snippet;
}
export { default as ButtonGroup } from './button-group.svelte';
