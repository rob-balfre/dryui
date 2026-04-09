import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
export interface FloatButtonRootProps extends HTMLAttributes<HTMLDivElement> {
	open?: boolean;
	children: Snippet;
}
export interface FloatButtonTriggerProps extends HTMLButtonAttributes {
	children: Snippet;
}
export interface FloatButtonActionProps extends HTMLButtonAttributes {
	children: Snippet;
}
import FloatButtonRoot from './float-button-root.svelte';
import FloatButtonTrigger from './float-button-trigger.svelte';
import FloatButtonAction from './float-button-action.svelte';
export declare const FloatButton: {
	Root: typeof FloatButtonRoot;
	Trigger: typeof FloatButtonTrigger;
	Action: typeof FloatButtonAction;
};
