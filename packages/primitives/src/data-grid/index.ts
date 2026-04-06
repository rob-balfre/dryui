import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type { DataGridContext } from './context.svelte.js';

export interface DataGridRootProps<T = unknown> extends HTMLAttributes<HTMLDivElement> {
	items: T[];
	pageSize?: number;
	selectable?: boolean;
	onSelectionChange?: (selected: string[]) => void;
	actionBar?: Snippet<[{ selectedCount: number; clearSelection: () => void }]>;
	children: Snippet;
}

export interface DataGridTableProps extends HTMLAttributes<HTMLTableElement> {
	children: Snippet;
}

export interface DataGridHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
	children: Snippet;
}

export interface DataGridColumnProps extends HTMLAttributes<HTMLTableCellElement> {
	key: string;
	sortable?: boolean;
	filterable?: boolean;
	pinned?: boolean;
	resizable?: boolean;
	header?: Snippet;
	children: Snippet;
}

export interface DataGridBodyProps<T = unknown> extends Omit<
	HTMLAttributes<HTMLTableSectionElement>,
	'children'
> {
	children: Snippet<[{ items: T[]; page: number }]>;
}

export interface DataGridRowProps extends HTMLAttributes<HTMLTableRowElement> {
	rowId?: string;
	children: Snippet;
}

export interface DataGridCellProps extends HTMLAttributes<HTMLTableCellElement> {
	children: Snippet;
}

export interface DataGridPaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
	children?:
		| Snippet<
				[
					{
						page: number;
						totalPages: number;
						totalItems: number;
						pageSize: number;
						canPrevious: boolean;
						canNext: boolean;
						previous: () => void;
						next: () => void;
						goto: (page: number) => void;
					}
				]
		  >
		| undefined;
}

export interface DataGridSelectAllProps extends HTMLAttributes<HTMLTableCellElement> {}

export interface DataGridSelectCellProps extends HTMLAttributes<HTMLTableCellElement> {
	rowId: string;
	rowLabel?: string;
}

export interface DataGridExpandableRowProps extends HTMLAttributes<HTMLTableRowElement> {
	rowId: string;
	expandable: Snippet;
	children: Snippet;
}

export interface DataGridExpandTriggerProps extends HTMLAttributes<HTMLButtonElement> {
	rowId: string;
	children?: Snippet;
}

import DataGridRoot from './data-grid-root.svelte';
import DataGridTable from './data-grid-table.svelte';
import DataGridHeader from './data-grid-header.svelte';
import DataGridColumn from './data-grid-column.svelte';
import DataGridBody from './data-grid-body.svelte';
import DataGridRow from './data-grid-row.svelte';
import DataGridCell from './data-grid-cell.svelte';
import DataGridPagination from './data-grid-pagination.svelte';
import DataGridSelectAll from './data-grid-select-all.svelte';
import DataGridSelectCell from './data-grid-select-cell.svelte';
import DataGridExpandableRow from './data-grid-expandable-row.svelte';
import DataGridExpandTrigger from './data-grid-expand-trigger.svelte';

export const DataGrid: {
	Root: typeof DataGridRoot;
	Table: typeof DataGridTable;
	Header: typeof DataGridHeader;
	Column: typeof DataGridColumn;
	Body: typeof DataGridBody;
	Row: typeof DataGridRow;
	Cell: typeof DataGridCell;
	Pagination: typeof DataGridPagination;
	SelectAll: typeof DataGridSelectAll;
	SelectCell: typeof DataGridSelectCell;
	ExpandableRow: typeof DataGridExpandableRow;
	ExpandTrigger: typeof DataGridExpandTrigger;
} = {
	Root: DataGridRoot,
	Table: DataGridTable,
	Header: DataGridHeader,
	Column: DataGridColumn,
	Body: DataGridBody,
	Row: DataGridRow,
	Cell: DataGridCell,
	Pagination: DataGridPagination,
	SelectAll: DataGridSelectAll,
	SelectCell: DataGridSelectCell,
	ExpandableRow: DataGridExpandableRow,
	ExpandTrigger: DataGridExpandTrigger
};
