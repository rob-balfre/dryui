import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
export interface DialogRootProps {
    open?: boolean;
    children: Snippet;
}
export interface DialogTriggerProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
export interface DialogContentProps extends HTMLAttributes<HTMLDialogElement> {
    children: Snippet;
}
export interface DialogOverlayProps extends HTMLAttributes<HTMLDivElement> {
}
export interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
export interface DialogBodyProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
export interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
export interface DialogCloseProps extends HTMLButtonAttributes {
    children: Snippet;
}
import DialogRoot from './dialog-root.svelte';
import DialogTrigger from './dialog-trigger.svelte';
import DialogContent from './dialog-content.svelte';
import DialogOverlay from './dialog-overlay.svelte';
import DialogHeader from './dialog-header.svelte';
import DialogBody from './dialog-body.svelte';
import DialogFooter from './dialog-footer.svelte';
import DialogClose from './dialog-close.svelte';
export declare const Dialog: {
    Root: typeof DialogRoot;
    Trigger: typeof DialogTrigger;
    Content: typeof DialogContent;
    Overlay: typeof DialogOverlay;
    Header: typeof DialogHeader;
    Body: typeof DialogBody;
    Footer: typeof DialogFooter;
    Close: typeof DialogClose;
};
