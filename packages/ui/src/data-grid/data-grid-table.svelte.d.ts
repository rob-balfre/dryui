import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLTableElement> {
	children: Snippet;
}
declare const DataGridTable: import('svelte').Component<Props, {}, ''>;
type DataGridTable = ReturnType<typeof DataGridTable>;
export default DataGridTable;
