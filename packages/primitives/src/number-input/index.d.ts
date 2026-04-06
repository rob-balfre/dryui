import type { HTMLInputAttributes } from 'svelte/elements';
export interface NumberInputProps extends HTMLInputAttributes {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
}
export { default as NumberInput } from './number-input.svelte';
