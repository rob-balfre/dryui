import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface FieldsetRootProps extends HTMLAttributes<HTMLFieldSetElement> {
	children: Snippet;
}
export interface FieldsetLegendProps extends HTMLAttributes<HTMLLegendElement> {
	children: Snippet;
}
export interface FieldsetDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
	children: Snippet;
}
export interface FieldsetContentProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
import FieldsetRoot from './fieldset-root.svelte';
import FieldsetLegend from './fieldset-legend.svelte';
import FieldsetDescription from './fieldset-description.svelte';
import FieldsetContent from './fieldset-content.svelte';
export declare const Fieldset: {
	Root: typeof FieldsetRoot;
	Legend: typeof FieldsetLegend;
	Description: typeof FieldsetDescription;
	Content: typeof FieldsetContent;
};
