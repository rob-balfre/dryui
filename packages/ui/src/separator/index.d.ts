import type { HTMLAttributes } from 'svelte/elements';
export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
    orientation?: 'horizontal' | 'vertical';
    variant?: 'weak' | 'strong';
    decorative?: boolean;
}
export { default as Separator } from './separator.svelte';
