export type {
	TocHeading,
	TableOfContentsRootProps,
	TableOfContentsListProps,
	TableOfContentsItemProps
} from '@dryui/primitives';

import TableOfContentsRoot from './table-of-contents-root.svelte';
import TableOfContentsList from './table-of-contents-list.svelte';
import TableOfContentsItem from './table-of-contents-item.svelte';

export const TableOfContents: {
	Root: typeof TableOfContentsRoot;
	List: typeof TableOfContentsList;
	Item: typeof TableOfContentsItem;
} = {
	Root: TableOfContentsRoot,
	List: TableOfContentsList,
	Item: TableOfContentsItem
};
