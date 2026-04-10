import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { DataGridRootProps as PrimitiveDataGridRootProps } from '@dryui/primitives';
export type { DataGridTableProps, DataGridHeaderProps, DataGridColumnProps, DataGridBodyProps, DataGridRowProps, DataGridCellProps, DataGridPaginationProps } from '@dryui/primitives';
export interface DataGridRootProps<T = unknown> extends PrimitiveDataGridRootProps<T> {
    striped?: boolean;
}
export interface DataGridSelectAllProps extends HTMLAttributes<HTMLTableCellElement> {
}
export interface DataGridSelectCellProps extends HTMLAttributes<HTMLTableCellElement> {
    rowId: string;
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
export declare const DataGrid: {
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
};
