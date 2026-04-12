import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLButtonElement> {
	children: Snippet;
	onclick?: () => void;
}
declare const ToastAction: import('svelte').Component<Props, {}, ''>;
type ToastAction = ReturnType<typeof ToastAction>;
export default ToastAction;
