import { createContext } from '../utils/create-context.js';

interface StepperContext {
	readonly activeStep: number;
	readonly orientation: 'horizontal' | 'vertical';
	isStepComplete: (index: number) => boolean;
	isStepActive: (index: number) => boolean;
}
export const [setStepperCtx, getStepperCtx] = createContext<StepperContext>('stepper');
