import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const ContextMenuLabel: import('svelte').Component<Props, {}, ''>;
type ContextMenuLabel = ReturnType<typeof ContextMenuLabel>;
export default ContextMenuLabel;
