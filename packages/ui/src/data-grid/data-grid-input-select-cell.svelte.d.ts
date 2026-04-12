import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLTableCellElement> {
	rowId: string;
}
declare const DataGridSelectCell: import('svelte').Component<Props, {}, ''>;
type DataGridSelectCell = ReturnType<typeof DataGridSelectCell>;
export default DataGridSelectCell;
