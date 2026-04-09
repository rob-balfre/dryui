import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface TreeRootProps extends HTMLAttributes<HTMLDivElement> {
	defaultExpanded?: string[];
	selectedItem?: string | null;
	children: Snippet;
}
export interface TreeItemProps extends HTMLAttributes<HTMLDivElement> {
	itemId: string;
	children: Snippet;
}
export interface TreeItemLabelProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
export interface TreeItemChildrenProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
import TreeRoot from './tree-root.svelte';
import TreeItem from './tree-item.svelte';
import TreeItemLabel from './tree-item-label.svelte';
import TreeItemChildren from './tree-item-children.svelte';
export declare const Tree: {
	Root: typeof TreeRoot;
	Item: typeof TreeItem;
	ItemLabel: typeof TreeItemLabel;
	ItemChildren: typeof TreeItemChildren;
};
