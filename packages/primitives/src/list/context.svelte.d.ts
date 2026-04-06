interface ListContext {
	readonly dense: boolean;
	readonly disablePadding: boolean;
}
export declare function setListCtx(ctx: ListContext): ListContext;
export declare function getListCtx(): ListContext;
export {};
