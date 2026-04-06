import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	page: number;
	children: Snippet;
}
declare const PaginationLink: import('svelte').Component<Props, {}, ''>;
type PaginationLink = ReturnType<typeof PaginationLink>;
export default PaginationLink;
