import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface ContextMenuRootProps {
    open?: boolean;
    children: Snippet;
}
export interface ContextMenuTriggerProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
export interface ContextMenuContentProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
export interface ContextMenuItemProps extends HTMLAttributes<HTMLDivElement> {
    disabled?: boolean;
    children: Snippet;
}
export interface ContextMenuSeparatorProps extends HTMLAttributes<HTMLDivElement> {
}
export interface ContextMenuGroupProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
export interface ContextMenuLabelProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
import ContextMenuRoot from './context-menu-root.svelte';
import ContextMenuTrigger from './context-menu-trigger.svelte';
import ContextMenuContent from './context-menu-content.svelte';
import ContextMenuItem from './context-menu-item.svelte';
import ContextMenuSeparator from './context-menu-separator.svelte';
import ContextMenuGroup from './context-menu-group.svelte';
import ContextMenuLabel from './context-menu-label.svelte';
export declare const ContextMenu: {
    Root: typeof ContextMenuRoot;
    Trigger: typeof ContextMenuTrigger;
    Content: typeof ContextMenuContent;
    Item: typeof ContextMenuItem;
    Separator: typeof ContextMenuSeparator;
    Group: typeof ContextMenuGroup;
    Label: typeof ContextMenuLabel;
};
