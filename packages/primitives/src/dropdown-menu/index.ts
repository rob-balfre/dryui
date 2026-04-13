import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { Placement } from '../utils/anchor-position.svelte.js';

export interface DropdownMenuRootProps {
	open?: boolean;
	children: Snippet;
}

export interface DropdownMenuTriggerProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
	placement?: Placement;
	offset?: number;
	children: Snippet;
}

export interface DropdownMenuItemProps extends HTMLAttributes<HTMLDivElement> {
	disabled?: boolean;
	children: Snippet;
}

export interface DropdownMenuSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

export interface DropdownMenuGroupProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface DropdownMenuLabelProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

import DropdownMenuRoot from './dropdown-menu-root.svelte';
import DropdownMenuTrigger from './dropdown-menu-trigger.svelte';
import DropdownMenuContent from './dropdown-menu-content.svelte';
import DropdownMenuItem from './dropdown-menu-item.svelte';
import DropdownMenuSeparator from '../internal/separator-div.svelte';
import DropdownMenuGroup from '../internal/group-div.svelte';
import DropdownMenuLabel from '../internal/presentation-div.svelte';

export const DropdownMenu: {
	Root: typeof DropdownMenuRoot;
	Trigger: typeof DropdownMenuTrigger;
	Content: typeof DropdownMenuContent;
	Item: typeof DropdownMenuItem;
	Separator: typeof DropdownMenuSeparator;
	Group: typeof DropdownMenuGroup;
	Label: typeof DropdownMenuLabel;
} = {
	Root: DropdownMenuRoot,
	Trigger: DropdownMenuTrigger,
	Content: DropdownMenuContent,
	Item: DropdownMenuItem,
	Separator: DropdownMenuSeparator,
	Group: DropdownMenuGroup,
	Label: DropdownMenuLabel
};
