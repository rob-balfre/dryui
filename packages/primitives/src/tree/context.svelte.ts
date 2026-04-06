import { createContext } from '../utils/create-context.js';

interface TreeContext {
	readonly expandedItems: Set<string>;
	readonly selectedItem: string | null;
	toggleItem: (id: string) => void;
	expandItem: (id: string) => void;
	collapseItem: (id: string) => void;
	selectItem: (id: string) => void;
	isExpanded: (id: string) => boolean;
	isSelected: (id: string) => boolean;
}
export const [setTreeCtx, getTreeCtx] = createContext<TreeContext>('tree');

interface TreeItemContext {
	readonly itemId: string;
}
export const [setTreeItemCtx, getTreeItemCtx] = createContext<TreeItemContext>('tree-item');
