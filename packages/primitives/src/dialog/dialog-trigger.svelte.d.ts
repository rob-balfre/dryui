import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const DialogTrigger: import('svelte').Component<Props, {}, ''>;
type DialogTrigger = ReturnType<typeof DialogTrigger>;
export default DialogTrigger;
