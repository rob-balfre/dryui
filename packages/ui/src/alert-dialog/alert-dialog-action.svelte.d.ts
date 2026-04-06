import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	children: Snippet;
}
declare const AlertDialogAction: import('svelte').Component<Props, {}, ''>;
type AlertDialogAction = ReturnType<typeof AlertDialogAction>;
export default AlertDialogAction;
