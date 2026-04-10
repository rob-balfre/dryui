import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export type ChromaticShiftChannels = 'rgb' | 'rb';
export type ChromaticShiftTrigger = 'hover' | 'always' | 'none';
export interface ChromaticShiftProps extends HTMLAttributes<HTMLDivElement> {
    offset?: number;
    channels?: ChromaticShiftChannels;
    trigger?: ChromaticShiftTrigger;
    animated?: boolean;
    children?: Snippet;
}
export { default as ChromaticShift } from './chromatic-shift.svelte';
