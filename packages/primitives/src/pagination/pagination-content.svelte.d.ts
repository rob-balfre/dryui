import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLUListElement> {
	children: Snippet;
}
declare const PaginationContent: import('svelte').Component<Props, {}, ''>;
type PaginationContent = ReturnType<typeof PaginationContent>;
export default PaginationContent;
