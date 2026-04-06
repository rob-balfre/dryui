import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLOListElement> {
	children: Snippet;
}
declare const StepperList: import('svelte').Component<Props, {}, ''>;
type StepperList = ReturnType<typeof StepperList>;
export default StepperList;
