import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	defaultExpanded?: string[];
	selectedItem?: string | null;
	children: Snippet;
}
declare const TreeRoot: import('svelte').Component<Props, {}, 'selectedItem'>;
type TreeRoot = ReturnType<typeof TreeRoot>;
export default TreeRoot;
