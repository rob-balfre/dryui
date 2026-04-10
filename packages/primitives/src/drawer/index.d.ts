import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
export interface DrawerRootProps {
    open?: boolean;
    side?: 'top' | 'right' | 'bottom' | 'left';
    children: Snippet;
}
export interface DrawerTriggerProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
export interface DrawerContentProps extends HTMLAttributes<HTMLDialogElement> {
    children: Snippet;
}
export interface DrawerOverlayProps extends HTMLAttributes<HTMLDivElement> {
}
export interface DrawerHeaderProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
export interface DrawerBodyProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
export interface DrawerFooterProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
export interface DrawerCloseProps extends HTMLButtonAttributes {
    children: Snippet;
}
import DrawerRoot from './drawer-root.svelte';
import DrawerTrigger from './drawer-trigger.svelte';
import DrawerContent from './drawer-content.svelte';
import DrawerOverlay from './drawer-overlay.svelte';
import DrawerHeader from './drawer-header.svelte';
import DrawerBody from './drawer-body.svelte';
import DrawerFooter from './drawer-footer.svelte';
import DrawerClose from './drawer-close.svelte';
export declare const Drawer: {
    Root: typeof DrawerRoot;
    Trigger: typeof DrawerTrigger;
    Content: typeof DrawerContent;
    Overlay: typeof DrawerOverlay;
    Header: typeof DrawerHeader;
    Body: typeof DrawerBody;
    Footer: typeof DrawerFooter;
    Close: typeof DrawerClose;
};
