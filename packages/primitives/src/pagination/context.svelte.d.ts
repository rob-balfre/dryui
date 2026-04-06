interface PaginationContext {
	readonly page: number;
	readonly totalPages: number;
	readonly canPrevious: boolean;
	readonly canNext: boolean;
	goto(page: number): void;
	previous(): void;
	next(): void;
}
export declare function setPaginationCtx(ctx: PaginationContext): PaginationContext;
export declare function getPaginationCtx(): PaginationContext;
export {};
