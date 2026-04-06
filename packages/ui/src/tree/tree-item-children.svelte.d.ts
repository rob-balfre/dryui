import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const TreeItemChildren: import('svelte').Component<Props, {}, ''>;
type TreeItemChildren = ReturnType<typeof TreeItemChildren>;
export default TreeItemChildren;
