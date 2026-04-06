import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	itemId: string;
	children: Snippet;
}
declare const TreeItem: import('svelte').Component<Props, {}, ''>;
type TreeItem = ReturnType<typeof TreeItem>;
export default TreeItem;
