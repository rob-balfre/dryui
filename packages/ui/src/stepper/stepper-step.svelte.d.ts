import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLAttributes<HTMLLIElement>, 'onclick'> {
	step: number;
	clickable?: boolean;
	error?: boolean;
	onclick?: (index: number) => void;
	children: Snippet;
}
declare const StepperStep: import('svelte').Component<Props, {}, ''>;
type StepperStep = ReturnType<typeof StepperStep>;
export default StepperStep;
