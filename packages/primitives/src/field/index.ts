import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface FieldRootProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
	error?: string;
	required?: boolean;
	disabled?: boolean;
	/**
	 * Opt-in: when true, Inputs inside this Field use a concentric inner
	 * radius derived from Field padding. Use when Field wraps Input inside a
	 * padded card/container so inner corners align with the outer edge.
	 */
	nestRadius?: boolean;
}

export interface FieldDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
	children: Snippet;
}

export interface FieldErrorProps extends HTMLAttributes<HTMLParagraphElement> {
	children: Snippet;
}

import FieldRoot from './field-root.svelte';
import FieldDescription from './field-description.svelte';
import FieldError from './field-error.svelte';

export const Field: {
	Root: typeof FieldRoot;
	Description: typeof FieldDescription;
	Error: typeof FieldError;
} = {
	Root: FieldRoot,
	Description: FieldDescription,
	Error: FieldError
};
