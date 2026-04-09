import type { HTMLTextareaAttributes } from 'svelte/elements';
export interface TextareaProps extends HTMLTextareaAttributes {
	value?: string;
	disabled?: boolean;
}
export { default as Textarea } from './textarea.svelte';
