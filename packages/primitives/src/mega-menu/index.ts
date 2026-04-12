import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';

export interface MegaMenuRootProps extends HTMLAttributes<HTMLElement> {
	children: Snippet;
}

export interface MegaMenuItemProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface MegaMenuTriggerProps extends HTMLButtonAttributes {
	children: Snippet;
}

export interface MegaMenuPanelProps extends HTMLAttributes<HTMLDivElement> {
	fullWidth?: boolean;
	children: Snippet;
}

export interface MegaMenuColumnProps extends HTMLAttributes<HTMLDivElement> {
	title?: string;
	children: Snippet;
}

export interface MegaMenuLinkProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
	href?: string;
	rel?: string;
	target?: string;
	download?: boolean | string;
	type?: 'button' | 'submit' | 'reset';
	icon?: Snippet;
	description?: Snippet;
	children: Snippet;
}

import MegaMenuRoot from './mega-menu-root.svelte';
import MegaMenuItem from './mega-menu-item.svelte';
import MegaMenuTrigger from './mega-menu-trigger.svelte';
import MegaMenuPanel from './mega-menu-panel.svelte';
import MegaMenuColumn from './mega-menu-column.svelte';
import MegaMenuLink from './mega-menu-link.svelte';

export const MegaMenu: {
	Root: typeof MegaMenuRoot;
	Item: typeof MegaMenuItem;
	Trigger: typeof MegaMenuTrigger;
	Panel: typeof MegaMenuPanel;
	Column: typeof MegaMenuColumn;
	Link: typeof MegaMenuLink;
} = {
	Root: MegaMenuRoot,
	Item: MegaMenuItem,
	Trigger: MegaMenuTrigger,
	Panel: MegaMenuPanel,
	Column: MegaMenuColumn,
	Link: MegaMenuLink
};
