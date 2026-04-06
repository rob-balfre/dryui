import type { HTMLAttributes } from 'svelte/elements';

export interface DateTimeInputProps extends HTMLAttributes<HTMLDivElement> {
	value?: Date;
	min?: Date;
	max?: Date;
	disabled?: boolean;
	locale?: string;
	name?: string;
}

export { default as DateTimeInput } from './date-time-input.svelte';
