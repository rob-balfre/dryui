import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLTableRowElement> {
	children: Snippet;
}
declare const TableRow: import('svelte').Component<Props, {}, ''>;
type TableRow = ReturnType<typeof TableRow>;
export default TableRow;
