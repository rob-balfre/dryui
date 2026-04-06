import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const AlertDialogBody: import('svelte').Component<Props, {}, ''>;
type AlertDialogBody = ReturnType<typeof AlertDialogBody>;
export default AlertDialogBody;
