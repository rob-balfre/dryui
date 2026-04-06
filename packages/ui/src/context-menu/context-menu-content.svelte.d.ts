import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const ContextMenuContent: import('svelte').Component<Props, {}, ''>;
type ContextMenuContent = ReturnType<typeof ContextMenuContent>;
export default ContextMenuContent;
