import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	activeStep?: number;
	orientation?: 'horizontal' | 'vertical';
	children: Snippet;
}
declare const StepperRoot: import('svelte').Component<Props, {}, 'activeStep'>;
type StepperRoot = ReturnType<typeof StepperRoot>;
export default StepperRoot;
