import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLElement> {
	page?: number;
	totalPages: number;
	children: Snippet;
}
declare const PaginationRoot: import('svelte').Component<Props, {}, 'page'>;
type PaginationRoot = ReturnType<typeof PaginationRoot>;
export default PaginationRoot;
