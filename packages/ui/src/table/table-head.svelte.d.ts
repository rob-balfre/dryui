import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLTableCellElement> {
	scope?: 'col' | 'row';
	children: Snippet;
}
declare const TableHead: import('svelte').Component<Props, {}, ''>;
type TableHead = ReturnType<typeof TableHead>;
export default TableHead;
