import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
export interface PaginationRootProps extends HTMLAttributes<HTMLElement> {
	page?: number;
	totalPages: number;
	children: Snippet;
}
export interface PaginationContentProps extends HTMLAttributes<HTMLUListElement> {
	children: Snippet;
}
export interface PaginationItemProps extends HTMLAttributes<HTMLLIElement> {
	children: Snippet;
}
export interface PaginationPreviousProps extends HTMLButtonAttributes {
	children: Snippet;
}
export interface PaginationNextProps extends HTMLButtonAttributes {
	children: Snippet;
}
export interface PaginationLinkProps extends HTMLButtonAttributes {
	page: number;
	children: Snippet;
}
export interface PaginationEllipsisProps extends HTMLAttributes<HTMLSpanElement> {}
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
