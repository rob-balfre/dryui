import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLTableSectionElement> {
	children: Snippet;
}
declare const TableBody: import('svelte').Component<Props, {}, ''>;
type TableBody = ReturnType<typeof TableBody>;
export default TableBody;
