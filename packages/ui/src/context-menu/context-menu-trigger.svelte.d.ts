import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const ContextMenuTrigger: import('svelte').Component<Props, {}, ''>;
type ContextMenuTrigger = ReturnType<typeof ContextMenuTrigger>;
export default ContextMenuTrigger;
