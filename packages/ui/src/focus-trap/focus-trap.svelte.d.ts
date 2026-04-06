import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	active?: boolean;
	initialFocus?: string;
	returnFocus?: boolean;
	children?: Snippet;
}
declare const FocusTrap: import('svelte').Component<Props, {}, ''>;
type FocusTrap = ReturnType<typeof FocusTrap>;
export default FocusTrap;
