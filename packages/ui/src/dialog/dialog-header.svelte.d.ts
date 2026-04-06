import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const DialogHeader: import('svelte').Component<Props, {}, ''>;
type DialogHeader = ReturnType<typeof DialogHeader>;
export default DialogHeader;
