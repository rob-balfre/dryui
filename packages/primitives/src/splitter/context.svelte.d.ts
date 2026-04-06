interface SplitterContext {
	readonly orientation: 'horizontal' | 'vertical';
	readonly sizes: number[];
	setSizes(sizes: number[]): void;
	startResize(index: number, event: PointerEvent): void;
}
export declare function setSplitterCtx(ctx: SplitterContext): SplitterContext;
export declare function getSplitterCtx(): SplitterContext;
export {};
