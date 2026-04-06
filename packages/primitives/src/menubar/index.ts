import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';

export interface MenubarRootProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface MenubarMenuProps {
	children: Snippet;
}

export interface MenubarTriggerProps extends HTMLButtonAttributes {
	children: Snippet;
}

export interface MenubarContentProps extends HTMLAttributes<HTMLDivElement> {
	placement?: 'bottom' | 'bottom-start' | 'bottom-end';
	offset?: number;
	children: Snippet;
}

export interface MenubarItemProps extends HTMLAttributes<HTMLDivElement> {
	disabled?: boolean;
	onSelect?: () => void;
	children: Snippet;
}

export interface MenubarSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

export interface MenubarLabelProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

import MenubarRoot from './menubar-root.svelte';
import MenubarMenu from './menubar-menu.svelte';
import MenubarTrigger from './menubar-trigger.svelte';
import MenubarContent from './menubar-content.svelte';
import MenubarItem from './menubar-item.svelte';
import MenubarSeparator from './menubar-separator.svelte';
import MenubarLabel from './menubar-label.svelte';

export const Menubar: {
	Root: typeof MenubarRoot;
	Menu: typeof MenubarMenu;
	Trigger: typeof MenubarTrigger;
	Content: typeof MenubarContent;
	Item: typeof MenubarItem;
	Separator: typeof MenubarSeparator;
	Label: typeof MenubarLabel;
} = {
	Root: MenubarRoot,
	Menu: MenubarMenu,
	Trigger: MenubarTrigger,
	Content: MenubarContent,
	Item: MenubarItem,
	Separator: MenubarSeparator,
	Label: MenubarLabel
};
