import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const AlertDialogFooter: import('svelte').Component<Props, {}, ''>;
type AlertDialogFooter = ReturnType<typeof AlertDialogFooter>;
export default AlertDialogFooter;
