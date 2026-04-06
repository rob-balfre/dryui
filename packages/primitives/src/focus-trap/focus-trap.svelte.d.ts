import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	active?: boolean | undefined;
	initialFocus?: string | undefined;
	returnFocus?: boolean | undefined;
	children?: Snippet | undefined;
}
declare const FocusTrap: import('svelte').Component<Props, {}, ''>;
type FocusTrap = ReturnType<typeof FocusTrap>;
export default FocusTrap;
