import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLTableCellElement> {
	key: string;
	sortable?: boolean;
	filterable?: boolean;
	pinned?: boolean;
	resizable?: boolean;
	header?: Snippet;
	children: Snippet;
}
declare const DataGridColumn: import('svelte').Component<Props, {}, ''>;
type DataGridColumn = ReturnType<typeof DataGridColumn>;
export default DataGridColumn;
