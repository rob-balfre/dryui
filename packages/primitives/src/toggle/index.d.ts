import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
export interface ToggleProps extends HTMLButtonAttributes {
    pressed?: boolean;
    disabled?: boolean;
    children?: Snippet;
}
export { default as Toggle } from './toggle.svelte';
