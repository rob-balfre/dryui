import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    children?: Snippet;
    variant?: string;
    pulse?: boolean;
    icon?: Snippet;
}
export { default as Badge } from './badge.svelte';
