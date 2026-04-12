import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	children: Snippet;
}
declare const AlertDialogCancel: import('svelte').Component<Props, {}, ''>;
type AlertDialogCancel = ReturnType<typeof AlertDialogCancel>;
export default AlertDialogCancel;
