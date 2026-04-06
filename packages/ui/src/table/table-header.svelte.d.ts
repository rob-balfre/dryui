import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLTableSectionElement> {
	children: Snippet;
}
declare const TableHeader: import('svelte').Component<Props, {}, ''>;
type TableHeader = ReturnType<typeof TableHeader>;
export default TableHeader;
