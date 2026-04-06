export interface RadioGroupContext {
	readonly name: string;
	readonly value: string;
	readonly disabled: boolean;
	readonly required: boolean;
	select: (value: string) => void;
}
export declare function setRadioGroupCtx(ctx: RadioGroupContext): RadioGroupContext;
export declare function getRadioGroupCtx(): RadioGroupContext;
