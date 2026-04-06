export type {
	StepperRootProps,
	StepperListProps,
	StepperStepProps,
	StepperSeparatorProps
} from '@dryui/primitives';

import StepperRoot from './stepper-root.svelte';
import StepperList from './stepper-list.svelte';
import StepperStep from './stepper-step.svelte';
import StepperSeparator from './stepper-separator.svelte';

export const Stepper: {
	Root: typeof StepperRoot;
	List: typeof StepperList;
	Step: typeof StepperStep;
	Separator: typeof StepperSeparator;
} = {
	Root: StepperRoot,
	List: StepperList,
	Step: StepperStep,
	Separator: StepperSeparator
};
