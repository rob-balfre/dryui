import type { HTMLInputAttributes } from 'svelte/elements';

export interface InputProps extends HTMLInputAttributes {
	value?: string;
	disabled?: boolean;
	type?: string;
}

export { default as Input } from './input.svelte';
