import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const ContextMenuGroup: import('svelte').Component<Props, {}, ''>;
type ContextMenuGroup = ReturnType<typeof ContextMenuGroup>;
export default ContextMenuGroup;
