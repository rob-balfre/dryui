interface ToggleGroupContext {
	readonly type: 'single' | 'multiple';
	readonly disabled: boolean;
	readonly value: string[];
	toggle: (itemValue: string) => void;
	isSelected: (itemValue: string) => boolean;
}
export declare function setToggleGroupCtx(ctx: ToggleGroupContext): ToggleGroupContext;
export declare function getToggleGroupCtx(): ToggleGroupContext;
export {};
