import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	children: Snippet;
}
declare const DialogClose: import('svelte').Component<Props, {}, ''>;
type DialogClose = ReturnType<typeof DialogClose>;
export default DialogClose;
