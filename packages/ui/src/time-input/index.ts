import type { HTMLAttributes } from 'svelte/elements';

export interface TimeInputProps extends Omit<
	HTMLAttributes<HTMLDivElement>,
	'role' | 'aria-label'
> {
	value?: string;
	disabled?: boolean;
	step?: number;
	size?: 'sm' | 'md' | 'lg';
	name?: string;
}

export { default as TimeInput } from './time-input.svelte';
