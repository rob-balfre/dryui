import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const AlertDialogHeader: import('svelte').Component<Props, {}, ''>;
type AlertDialogHeader = ReturnType<typeof AlertDialogHeader>;
export default AlertDialogHeader;
