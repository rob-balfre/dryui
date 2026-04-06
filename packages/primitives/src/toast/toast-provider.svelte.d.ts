import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	position?:
		| 'top-right'
		| 'top-left'
		| 'bottom-right'
		| 'bottom-left'
		| 'top-center'
		| 'bottom-center';
	children?: Snippet;
}
declare const ToastProvider: import('svelte').Component<Props, {}, ''>;
type ToastProvider = ReturnType<typeof ToastProvider>;
export default ToastProvider;
