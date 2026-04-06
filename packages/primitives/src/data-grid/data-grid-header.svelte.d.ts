import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLTableSectionElement> {
	children: Snippet;
}
declare const DataGridHeader: import('svelte').Component<Props, {}, ''>;
type DataGridHeader = ReturnType<typeof DataGridHeader>;
export default DataGridHeader;
