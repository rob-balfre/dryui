import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';

export interface CollapsibleRootProps extends HTMLAttributes<HTMLDivElement> {
	open?: boolean;
	disabled?: boolean;
	children: Snippet;
}

export interface CollapsibleTriggerProps extends HTMLButtonAttributes {
	children: Snippet;
}

export interface CollapsibleContentProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

import CollapsibleRoot from './collapsible-root.svelte';
import CollapsibleTrigger from './collapsible-button-trigger.svelte';
import CollapsibleContent from './collapsible-content.svelte';

export const Collapsible: {
	Root: typeof CollapsibleRoot;
	Trigger: typeof CollapsibleTrigger;
	Content: typeof CollapsibleContent;
} = {
	Root: CollapsibleRoot,
	Trigger: CollapsibleTrigger,
	Content: CollapsibleContent
};
