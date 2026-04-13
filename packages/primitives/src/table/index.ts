import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface TableRootProps extends HTMLAttributes<HTMLTableElement> {
	children: Snippet;
}

export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
	children: Snippet;
}

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
	children: Snippet;
}

export interface TableFooterProps extends HTMLAttributes<HTMLTableSectionElement> {
	children: Snippet;
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
	children: Snippet;
}

export interface TableHeadProps extends HTMLAttributes<HTMLTableCellElement> {
	scope?: 'col' | 'row';
	children: Snippet;
}

export interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
	children: Snippet;
}

export interface TableCaptionProps extends HTMLAttributes<HTMLTableCaptionElement> {
	children: Snippet;
}

import TableRoot from '../internal/table-root.svelte';
import TableHeader from '../internal/table-header.svelte';
import TableBody from './table-body.svelte';
import TableFooter from './table-footer.svelte';
import TableRow from './table-row.svelte';
import TableHead from './table-head.svelte';
import TableCell from './table-cell.svelte';
import TableCaption from './table-caption.svelte';

export const Table: {
	Root: typeof TableRoot;
	Header: typeof TableHeader;
	Body: typeof TableBody;
	Footer: typeof TableFooter;
	Row: typeof TableRow;
	Head: typeof TableHead;
	Cell: typeof TableCell;
	Caption: typeof TableCaption;
} = {
	Root: TableRoot,
	Header: TableHeader,
	Body: TableBody,
	Footer: TableFooter,
	Row: TableRow,
	Head: TableHead,
	Cell: TableCell,
	Caption: TableCaption
};
