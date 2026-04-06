import { createContext } from '@dryui/primitives';

interface StepperContext {
	readonly activeStep: number;
	readonly orientation: 'horizontal' | 'vertical';
	isStepComplete: (index: number) => boolean;
	isStepActive: (index: number) => boolean;
}
export const [setStepperCtx, getStepperCtx] = createContext<StepperContext>('stepper');
