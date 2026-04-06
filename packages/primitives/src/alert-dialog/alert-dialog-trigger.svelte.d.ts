import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const AlertDialogTrigger: import('svelte').Component<Props, {}, ''>;
type AlertDialogTrigger = ReturnType<typeof AlertDialogTrigger>;
export default AlertDialogTrigger;
