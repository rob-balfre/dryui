import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLTableCellElement> {
	children: Snippet;
}
declare const TableCell: import('svelte').Component<Props, {}, ''>;
type TableCell = ReturnType<typeof TableCell>;
export default TableCell;
