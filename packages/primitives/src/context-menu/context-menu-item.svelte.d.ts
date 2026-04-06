import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	disabled?: boolean;
	children: Snippet;
}
declare const ContextMenuItem: import('svelte').Component<Props, {}, ''>;
type ContextMenuItem = ReturnType<typeof ContextMenuItem>;
export default ContextMenuItem;
