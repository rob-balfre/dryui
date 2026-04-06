import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	children: Snippet;
}
declare const PaginationNext: import('svelte').Component<Props, {}, ''>;
type PaginationNext = ReturnType<typeof PaginationNext>;
export default PaginationNext;
