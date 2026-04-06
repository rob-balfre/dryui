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
export declare function setTreeCtx(ctx: TreeContext): TreeContext;
export declare function getTreeCtx(): TreeContext;

interface TreeItemContext {
	readonly itemId: string;
}
export declare function setTreeItemCtx(ctx: TreeItemContext): TreeItemContext;
export declare function getTreeItemCtx(): TreeItemContext;
export {};
