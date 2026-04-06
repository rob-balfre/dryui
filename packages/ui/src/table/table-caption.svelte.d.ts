import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLElement> {
	children: Snippet;
}
declare const TableCaption: import('svelte').Component<Props, {}, ''>;
type TableCaption = ReturnType<typeof TableCaption>;
export default TableCaption;
