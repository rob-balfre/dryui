export type {
	TocHeading,
	TableOfContentsRootProps,
	TableOfContentsListProps,
	TableOfContentsItemProps
} from '@dryui/primitives';
import TableOfContentsRoot from './table-of-contents-root.svelte';
import TableOfContentsList from './table-of-contents-list.svelte';
import TableOfContentsItem from './table-of-contents-item.svelte';
export declare const TableOfContents: {
	Root: typeof TableOfContentsRoot;
	List: typeof TableOfContentsList;
	Item: typeof TableOfContentsItem;
};
