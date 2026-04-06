interface ChipGroupContext {
	readonly type: 'single' | 'multiple';
	readonly disabled: boolean;
	readonly value: string[];
	toggle: (itemValue: string) => void;
	isSelected: (itemValue: string) => boolean;
}
export declare function setChipGroupCtx(ctx: ChipGroupContext): ChipGroupContext;
export declare function getChipGroupCtx(): ChipGroupContext;
export {};
