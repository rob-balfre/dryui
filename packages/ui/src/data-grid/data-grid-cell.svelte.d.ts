import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLTableCellElement> {
	children: Snippet;
}
declare const DataGridCell: import('svelte').Component<Props, {}, ''>;
type DataGridCell = ReturnType<typeof DataGridCell>;
export default DataGridCell;
