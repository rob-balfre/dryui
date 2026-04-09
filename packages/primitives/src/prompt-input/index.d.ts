import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface PromptInputProps extends HTMLAttributes<HTMLDivElement> {
	value?: string;
	placeholder?: string;
	disabled?: boolean;
	submitLabel?: string;
	onpromptsubmit?: (value: string) => void;
	actions?: Snippet;
}
export { default as PromptInput } from './prompt-input.svelte';
