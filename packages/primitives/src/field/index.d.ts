import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface FieldRootProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
    error?: string;
    required?: boolean;
    disabled?: boolean;
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
export declare const Field: {
    Root: typeof FieldRoot;
    Description: typeof FieldDescription;
    Error: typeof FieldError;
};
