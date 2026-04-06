import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	id: string;
	variant?: 'info' | 'success' | 'warning' | 'error';
	persistent?: boolean;
	progress?: number;
	children: Snippet;
}
declare const ToastRoot: import('svelte').Component<Props, {}, ''>;
type ToastRoot = ReturnType<typeof ToastRoot>;
export default ToastRoot;
