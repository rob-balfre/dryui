import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	step: number;
}
declare const StepperSeparator: import('svelte').Component<Props, {}, ''>;
type StepperSeparator = ReturnType<typeof StepperSeparator>;
export default StepperSeparator;
