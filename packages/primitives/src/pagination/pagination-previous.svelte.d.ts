import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	children: Snippet;
}
declare const PaginationPrevious: import('svelte').Component<Props, {}, ''>;
type PaginationPrevious = ReturnType<typeof PaginationPrevious>;
export default PaginationPrevious;
