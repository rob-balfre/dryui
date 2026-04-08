export interface TimeInputProps {
	value?: string;
	disabled?: boolean;
	step?: number;
	size?: 'sm' | 'md' | 'lg';
	name?: string;
	class?: string;
}
export { default as TimeInput } from './time-input.svelte';
