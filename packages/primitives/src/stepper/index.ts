import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface StepperRootProps extends HTMLAttributes<HTMLDivElement> {
	activeStep?: number;
	orientation?: 'horizontal' | 'vertical';
	children: Snippet;
}

export interface StepperListProps extends HTMLAttributes<HTMLOListElement> {
	children: Snippet;
}

export interface StepperStepProps extends Omit<HTMLAttributes<HTMLLIElement>, 'onclick'> {
	step: number;
	clickable?: boolean;
	error?: boolean;
	onclick?: (index: number) => void;
	children: Snippet;
}

export interface StepperSeparatorProps extends HTMLAttributes<HTMLDivElement> {
	step: number;
}

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
