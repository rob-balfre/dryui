interface CollapsibleContext {
	readonly open: boolean;
	readonly disabled: boolean;
	toggle: () => void;
}
export declare function setCollapsibleCtx(ctx: CollapsibleContext): CollapsibleContext;
export declare function getCollapsibleCtx(): CollapsibleContext;
export {};
