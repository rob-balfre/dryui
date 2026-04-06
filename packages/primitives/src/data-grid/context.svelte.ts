import { createContext } from '../utils/create-context.js';

export interface DataGridContext<T = unknown> {
	readonly sortColumn: string | null;
	readonly sortDirection: 'asc' | 'desc';
	readonly page: number;
	readonly pageSize: number;
	readonly totalItems: number;
	readonly totalPages: number;
	readonly filteredItems: T[];
	readonly pagedItems: T[];
	sort: (column: string) => void;
	setPage: (page: number) => void;
	setFilter: (column: string, value: string) => void;
	getFilter: (column: string) => string;
	// Selection
	readonly selectable: boolean;
	readonly selectedItems: string[];
	toggleSelect: (id: string) => void;
	toggleSelectAll: () => void;
	isSelected: (id: string) => boolean;
	clearSelection: () => void;
	// Expandable rows
	readonly expandedRows: string[];
	toggleExpand: (id: string) => void;
	isExpanded: (id: string) => boolean;
	// Column pinning & resizing
	readonly columnWidths: Record<string, number>;
	setColumnWidth: (key: string, width: number) => void;
}
export const [setDataGridCtx, getDataGridCtx] = createContext<DataGridContext>('data-grid');
