export type {
	PaginationRootProps,
	PaginationContentProps,
	PaginationItemProps,
	PaginationPreviousProps,
	PaginationNextProps,
	PaginationLinkProps,
	PaginationEllipsisProps
} from '@dryui/primitives';
import PaginationRoot from './pagination-root.svelte';
import PaginationContent from './pagination-content.svelte';
import PaginationItem from './pagination-item.svelte';
import PaginationPrevious from './pagination-previous.svelte';
import PaginationNext from './pagination-next.svelte';
import PaginationLink from './pagination-link.svelte';
import PaginationEllipsis from './pagination-ellipsis.svelte';
export declare const Pagination: {
	Root: typeof PaginationRoot;
	Content: typeof PaginationContent;
	Item: typeof PaginationItem;
	Previous: typeof PaginationPrevious;
	Next: typeof PaginationNext;
	Link: typeof PaginationLink;
	Ellipsis: typeof PaginationEllipsis;
};
