import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLElement> {
	selector?: string;
	headingSelector?: string;
	rootMargin?: string;
	autoId?: boolean;
	children: Snippet;
}
declare const TableOfContentsRoot: import('svelte').Component<Props, {}, ''>;
type TableOfContentsRoot = ReturnType<typeof TableOfContentsRoot>;
export default TableOfContentsRoot;
