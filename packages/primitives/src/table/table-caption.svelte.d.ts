import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLTableCaptionElement> {
	children: Snippet;
}
declare const TableCaption: import('svelte').Component<Props, {}, ''>;
type TableCaption = ReturnType<typeof TableCaption>;
export default TableCaption;
