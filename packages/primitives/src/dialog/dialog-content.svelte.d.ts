import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDialogElement> {
	children: Snippet;
}
declare const DialogContent: import('svelte').Component<Props, {}, ''>;
type DialogContent = ReturnType<typeof DialogContent>;
export default DialogContent;
