import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLTableRowElement> {
	rowId?: string;
	children: Snippet;
}
declare const DataGridRow: import('svelte').Component<Props, {}, ''>;
type DataGridRow = ReturnType<typeof DataGridRow>;
export default DataGridRow;
