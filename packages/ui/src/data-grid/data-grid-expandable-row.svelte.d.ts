import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLTableRowElement> {
	rowId: string;
	expandable: Snippet;
	children: Snippet;
}
declare const DataGridExpandableRow: import('svelte').Component<Props, {}, ''>;
type DataGridExpandableRow = ReturnType<typeof DataGridExpandableRow>;
export default DataGridExpandableRow;
