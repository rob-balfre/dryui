import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { TocHeading } from './context.svelte.js';
interface Props extends HTMLAttributes<HTMLLIElement> {
	heading: TocHeading;
	children?: Snippet<
		[
			{
				heading: TocHeading;
				active: boolean;
			}
		]
	>;
}
declare const TableOfContentsItem: import('svelte').Component<Props, {}, ''>;
type TableOfContentsItem = ReturnType<typeof TableOfContentsItem>;
export default TableOfContentsItem;
