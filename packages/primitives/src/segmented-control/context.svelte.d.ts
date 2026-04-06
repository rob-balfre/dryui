export interface SegmentedControlContext {
	readonly value: string;
	readonly disabled: boolean;
	readonly orientation: 'horizontal' | 'vertical';
	select: (value: string) => void;
}
export declare function setSegmentedControlCtx(
	ctx: SegmentedControlContext
): SegmentedControlContext;
export declare function getSegmentedControlCtx(): SegmentedControlContext;
