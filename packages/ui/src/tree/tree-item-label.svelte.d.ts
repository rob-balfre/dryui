import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const TreeItemLabel: import('svelte').Component<Props, {}, ''>;
type TreeItemLabel = ReturnType<typeof TreeItemLabel>;
export default TreeItemLabel;
