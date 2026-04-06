import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
export interface AlertDialogRootProps {
    open?: boolean;
    children: Snippet;
}
export interface AlertDialogTriggerProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
export interface AlertDialogContentProps extends HTMLAttributes<HTMLDialogElement> {
    children: Snippet;
}
export interface AlertDialogOverlayProps extends HTMLAttributes<HTMLDivElement> {
}
export interface AlertDialogHeaderProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
export interface AlertDialogBodyProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
export interface AlertDialogFooterProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
export interface AlertDialogActionProps extends HTMLButtonAttributes {
    children: Snippet;
}
export interface AlertDialogCancelProps extends HTMLButtonAttributes {
    children: Snippet;
}
import AlertDialogRoot from './alert-dialog-root.svelte';
import AlertDialogTrigger from './alert-dialog-trigger.svelte';
import AlertDialogContent from './alert-dialog-content.svelte';
import AlertDialogOverlay from './alert-dialog-overlay.svelte';
import AlertDialogHeader from './alert-dialog-header.svelte';
import AlertDialogBody from './alert-dialog-body.svelte';
import AlertDialogFooter from './alert-dialog-footer.svelte';
import AlertDialogAction from './alert-dialog-action.svelte';
import AlertDialogCancel from './alert-dialog-cancel.svelte';
export declare const AlertDialog: {
    Root: typeof AlertDialogRoot;
    Trigger: typeof AlertDialogTrigger;
    Content: typeof AlertDialogContent;
    Overlay: typeof AlertDialogOverlay;
    Header: typeof AlertDialogHeader;
    Body: typeof AlertDialogBody;
    Footer: typeof AlertDialogFooter;
    Action: typeof AlertDialogAction;
    Cancel: typeof AlertDialogCancel;
};
