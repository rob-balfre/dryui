import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLTableSectionElement> {
	children: Snippet;
}
declare const TableFooter: import('svelte').Component<Props, {}, ''>;
type TableFooter = ReturnType<typeof TableFooter>;
export default TableFooter;
