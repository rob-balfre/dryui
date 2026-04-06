export type {
	TreeRootProps,
	TreeItemProps,
	TreeItemLabelProps,
	TreeItemChildrenProps
} from '@dryui/primitives';
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
