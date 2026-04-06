import type { HTMLInputAttributes } from 'svelte/elements';

export interface TimeInputProps extends HTMLInputAttributes {
	value?: string;
	disabled?: boolean;
	step?: number;
}

export { default as TimeInput } from './time-input.svelte';
