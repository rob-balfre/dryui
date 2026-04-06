import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLParagraphElement> {
	children: Snippet;
}
declare const ToastTitle: import('svelte').Component<Props, {}, ''>;
type ToastTitle = ReturnType<typeof ToastTitle>;
export default ToastTitle;
