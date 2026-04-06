import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface ListRootProps extends HTMLAttributes<HTMLUListElement> {
	dense?: boolean;
	disablePadding?: boolean;
	children: Snippet;
}

export interface ListItemProps extends HTMLAttributes<HTMLLIElement> {
	interactive?: boolean;
	disabled?: boolean;
	children: Snippet;
}

export interface ListItemIconProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface ListItemTextProps extends HTMLAttributes<HTMLDivElement> {
	primary?: Snippet;
	secondary?: Snippet;
	children?: Snippet;
}

export interface ListSubheaderProps extends HTMLAttributes<HTMLLIElement> {
	children: Snippet;
}

import ListRoot from './list-root.svelte';
import ListItem from './list-item.svelte';
import ListItemIcon from './list-item-icon.svelte';
import ListItemText from './list-item-text.svelte';
import ListSubheader from './list-subheader.svelte';

export const List: {
	Root: typeof ListRoot;
	Item: typeof ListItem;
	ItemIcon: typeof ListItemIcon;
	ItemText: typeof ListItemText;
	Subheader: typeof ListSubheader;
} = {
	Root: ListRoot,
	Item: ListItem,
	ItemIcon: ListItemIcon,
	ItemText: ListItemText,
	Subheader: ListSubheader
};
