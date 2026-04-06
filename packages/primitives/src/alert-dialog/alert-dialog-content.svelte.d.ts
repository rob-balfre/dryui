import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDialogElement> {
	children: Snippet;
}
declare const AlertDialogContent: import('svelte').Component<Props, {}, ''>;
type AlertDialogContent = ReturnType<typeof AlertDialogContent>;
export default AlertDialogContent;
