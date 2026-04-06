interface SelectableTileGroupContext {
	readonly value: string;
	readonly disabled: boolean;
	readonly orientation: 'horizontal' | 'vertical';
	select: (value: string) => void;
	isSelected: (value: string) => boolean;
}
export declare function setSelectableTileGroupCtx(
	ctx: SelectableTileGroupContext
): SelectableTileGroupContext;
export declare function getSelectableTileGroupCtx(): SelectableTileGroupContext;
export {};
