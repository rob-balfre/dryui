import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { ButtonSize, ButtonVariant } from '../button/index.js';

export interface PromptInputProps extends HTMLAttributes<HTMLDivElement> {
	value?: string;
	placeholder?: string;
	disabled?: boolean;
	submitLabel?: string;
	submitSize?: ButtonSize;
	submitVariant?: ButtonVariant;
	onpromptsubmit?: (value: string) => void;
	actions?: Snippet;
}

export { default as PromptInput } from './prompt-input-button-textarea.svelte';
