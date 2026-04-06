import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLTableElement> {
	children: Snippet;
}
declare const TableRoot: import('svelte').Component<Props, {}, ''>;
type TableRoot = ReturnType<typeof TableRoot>;
export default TableRoot;
