import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const DialogFooter: import('svelte').Component<Props, {}, ''>;
type DialogFooter = ReturnType<typeof DialogFooter>;
export default DialogFooter;
