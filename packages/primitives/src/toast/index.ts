import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';

export { toastStore, createToastStore } from './toast-store.svelte.js';
export type { ToastData } from './toast-store.svelte.js';

export interface ToastProviderProps extends HTMLAttributes<HTMLDivElement> {
	position?:
		| 'top-right'
		| 'top-left'
		| 'bottom-right'
		| 'bottom-left'
		| 'top-center'
		| 'bottom-center';
	children?: Snippet;
}

export interface ToastRootProps extends HTMLAttributes<HTMLDivElement> {
	id: string;
	variant?: 'info' | 'success' | 'warning' | 'error';
	persistent?: boolean;
	progress?: number;
	children: Snippet;
}

export interface ToastActionProps extends HTMLAttributes<HTMLButtonElement> {
	children: Snippet;
	onclick?: () => void;
}

export interface ToastTitleProps extends HTMLAttributes<HTMLParagraphElement> {
	children: Snippet;
}

export interface ToastDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
	children: Snippet;
}

export interface ToastCloseProps extends HTMLButtonAttributes {
	children: Snippet;
}

import ToastProvider from './toast-provider.svelte';
import ToastRoot from './toast-root.svelte';
import ToastTitle from './toast-title.svelte';
import ToastDescription from './toast-description.svelte';
import ToastClose from './toast-close.svelte';
import ToastAction from './toast-action.svelte';

export const Toast: {
	Provider: typeof ToastProvider;
	Root: typeof ToastRoot;
	Title: typeof ToastTitle;
	Description: typeof ToastDescription;
	Close: typeof ToastClose;
	Action: typeof ToastAction;
} = {
	Provider: ToastProvider,
	Root: ToastRoot,
	Title: ToastTitle,
	Description: ToastDescription,
	Close: ToastClose,
	Action: ToastAction
};
