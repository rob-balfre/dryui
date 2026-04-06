import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLParagraphElement> {
	children: Snippet;
}
declare const ToastDescription: import('svelte').Component<Props, {}, ''>;
type ToastDescription = ReturnType<typeof ToastDescription>;
export default ToastDescription;
