interface StepperContext {
	readonly activeStep: number;
	readonly orientation: 'horizontal' | 'vertical';
	isStepComplete: (index: number) => boolean;
	isStepActive: (index: number) => boolean;
}
export declare function setStepperCtx(ctx: StepperContext): StepperContext;
export declare function getStepperCtx(): StepperContext;
export {};
