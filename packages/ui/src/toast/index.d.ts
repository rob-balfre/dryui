export { toastStore, createToastStore } from '@dryui/primitives';
export type { ToastData, ToastProviderProps, ToastRootProps, ToastActionProps, ToastTitleProps, ToastDescriptionProps, ToastCloseProps } from '@dryui/primitives';
import ToastProvider from './toast-provider.svelte';
import ToastRoot from './toast-root.svelte';
import ToastTitle from './toast-title.svelte';
import ToastDescription from './toast-description.svelte';
import ToastClose from './toast-close.svelte';
import ToastAction from './toast-action.svelte';
export declare const Toast: {
    Provider: typeof ToastProvider;
    Root: typeof ToastRoot;
    Title: typeof ToastTitle;
    Description: typeof ToastDescription;
    Close: typeof ToastClose;
    Action: typeof ToastAction;
};
