import type { Snippet } from 'svelte';
interface Props {
	open?: boolean;
	children: Snippet;
}
declare const AlertDialogRoot: import('svelte').Component<Props, {}, 'open'>;
type AlertDialogRoot = ReturnType<typeof AlertDialogRoot>;
export default AlertDialogRoot;
