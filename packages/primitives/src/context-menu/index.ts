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

export interface ContextMenuSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

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
import ContextMenuSeparator from '../internal/separator-div.svelte';
import ContextMenuGroup from '../internal/group-div.svelte';
import ContextMenuLabel from '../internal/presentation-div.svelte';

export const ContextMenu: {
	Root: typeof ContextMenuRoot;
	Trigger: typeof ContextMenuTrigger;
	Content: typeof ContextMenuContent;
	Item: typeof ContextMenuItem;
	Separator: typeof ContextMenuSeparator;
	Group: typeof ContextMenuGroup;
	Label: typeof ContextMenuLabel;
} = {
	Root: ContextMenuRoot,
	Trigger: ContextMenuTrigger,
	Content: ContextMenuContent,
	Item: ContextMenuItem,
	Separator: ContextMenuSeparator,
	Group: ContextMenuGroup,
	Label: ContextMenuLabel
};
