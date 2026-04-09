import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export type { TocHeading } from './context.svelte.js';
export interface TableOfContentsRootProps extends HTMLAttributes<HTMLElement> {
	selector?: string;
	headingSelector?: string;
	rootMargin?: string;
	autoId?: boolean;
	children: Snippet;
}
export interface TableOfContentsListProps extends HTMLAttributes<HTMLOListElement> {}
export interface TableOfContentsItemProps extends Omit<HTMLAttributes<HTMLLIElement>, 'children'> {
	heading: import('./context.svelte.js').TocHeading;
	children?: Snippet<
		[
			{
				heading: import('./context.svelte.js').TocHeading;
				active: boolean;
			}
		]
	>;
}
import TableOfContentsRoot from './table-of-contents-root.svelte';
import TableOfContentsList from './table-of-contents-list.svelte';
import TableOfContentsItem from './table-of-contents-item.svelte';
export declare const TableOfContents: {
	Root: typeof TableOfContentsRoot;
	List: typeof TableOfContentsList;
	Item: typeof TableOfContentsItem;
};
