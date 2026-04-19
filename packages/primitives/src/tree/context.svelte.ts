import { createContext } from '../utils/create-context.js';

interface TreeContext {
	readonly expandedItems: ReadonlySet<string>;
	readonly selectedItem: string | null;
	readonly focusedItem: string | null;
	toggleItem: (id: string) => void;
	expandItem: (id: string) => void;
	collapseItem: (id: string) => void;
	selectItem: (id: string) => void;
	setFocusedItem: (id: string) => void;
	registerBranch: (id: string) => void;
	unregisterBranch: (id: string) => void;
	isExpanded: (id: string) => boolean;
	isSelected: (id: string) => boolean;
	isFocused: (id: string) => boolean;
	hasChildren: (id: string) => boolean;
}
export const [setTreeCtx, getTreeCtx] = createContext<TreeContext>('tree');

interface TreeItemContext {
	readonly itemId: string;
}
export const [setTreeItemCtx, getTreeItemCtx] = createContext<TreeItemContext>('tree-item');
