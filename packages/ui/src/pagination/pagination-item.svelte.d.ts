import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLLIElement> {
	children: Snippet;
}
declare const PaginationItem: import('svelte').Component<Props, {}, ''>;
type PaginationItem = ReturnType<typeof PaginationItem>;
export default PaginationItem;
