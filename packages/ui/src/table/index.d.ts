export type {
	TableRootProps,
	TableHeaderProps,
	TableBodyProps,
	TableFooterProps,
	TableRowProps,
	TableHeadProps,
	TableCellProps,
	TableCaptionProps
} from '@dryui/primitives';
import TableRoot from './table-root.svelte';
import TableHeader from './table-header.svelte';
import TableBody from './table-body.svelte';
import TableFooter from './table-footer.svelte';
import TableRow from './table-row.svelte';
import TableHead from './table-head.svelte';
import TableCell from './table-cell.svelte';
import TableCaption from './table-caption.svelte';
export declare const Table: {
	Root: typeof TableRoot;
	Header: typeof TableHeader;
	Body: typeof TableBody;
	Footer: typeof TableFooter;
	Row: typeof TableRow;
	Head: typeof TableHead;
	Cell: typeof TableCell;
	Caption: typeof TableCaption;
};
