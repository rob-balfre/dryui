import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface ChromaticAberrationProps extends HTMLAttributes<HTMLDivElement> {
    offset?: number;
    angle?: number;
    children: Snippet;
}
export { default as ChromaticAberration } from './chromatic-aberration.svelte';
