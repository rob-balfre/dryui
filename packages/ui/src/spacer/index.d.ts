import type { HTMLAttributes } from 'svelte/elements';
export interface SpacerProps extends HTMLAttributes<HTMLDivElement> {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    axis?: 'vertical' | 'horizontal';
}
export { default as Spacer } from './spacer.svelte';
