import type { HTMLAttributes } from 'svelte/elements';
export interface ProgressRingProps extends HTMLAttributes<HTMLDivElement> {
    value?: number | undefined;
    max?: number;
    size?: number;
    strokeWidth?: number;
}
export { default as ProgressRing } from './progress-ring.svelte';
