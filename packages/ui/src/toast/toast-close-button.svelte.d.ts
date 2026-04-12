import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	children: Snippet;
}
declare const ToastClose: import('svelte').Component<Props, {}, ''>;
type ToastClose = ReturnType<typeof ToastClose>;
export default ToastClose;
