import type { HTMLInputAttributes } from 'svelte/elements';

export interface CheckboxProps extends HTMLInputAttributes {
	checked?: boolean;
	indeterminate?: boolean;
	disabled?: boolean;
}

export { default as Checkbox } from './checkbox.svelte';
