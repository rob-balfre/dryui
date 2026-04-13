import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';

export interface SidebarRootProps extends HTMLAttributes<HTMLElement> {
	collapsed?: boolean;
	side?: 'left' | 'right';
	children: Snippet;
}

export interface SidebarHeaderProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface SidebarContentProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface SidebarFooterProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface SidebarGroupProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface SidebarGroupLabelProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface SidebarItemProps extends HTMLAnchorAttributes {
	active?: boolean;
	children: Snippet;
}

export interface SidebarTriggerProps extends HTMLButtonAttributes {
	children?: Snippet;
}

import SidebarRoot from './sidebar-root.svelte';
import SidebarHeader from '../internal/snippet-div.svelte';
import SidebarContent from './sidebar-content.svelte';
import SidebarFooter from '../internal/snippet-div.svelte';
import SidebarGroup from './sidebar-group.svelte';
import SidebarGroupLabel from './sidebar-group-label.svelte';
import SidebarItem from './sidebar-item.svelte';
import SidebarTrigger from './sidebar-trigger.svelte';

export const Sidebar: {
	Root: typeof SidebarRoot;
	Header: typeof SidebarHeader;
	Content: typeof SidebarContent;
	Footer: typeof SidebarFooter;
	Group: typeof SidebarGroup;
	GroupLabel: typeof SidebarGroupLabel;
	Item: typeof SidebarItem;
	Trigger: typeof SidebarTrigger;
} = {
	Root: SidebarRoot,
	Header: SidebarHeader,
	Content: SidebarContent,
	Footer: SidebarFooter,
	Group: SidebarGroup,
	GroupLabel: SidebarGroupLabel,
	Item: SidebarItem,
	Trigger: SidebarTrigger
};
