import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const DialogBody: import('svelte').Component<Props, {}, ''>;
type DialogBody = ReturnType<typeof DialogBody>;
export default DialogBody;
