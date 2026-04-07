<script lang="ts" generics="T extends Record<string, unknown>">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setDataGridCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		items: T[];
		pageSize?: number;
		striped?: boolean;
		selectable?: boolean;
		onSelectionChange?: (selected: string[]) => void;
		actionBar?: Snippet<[{ selectedCount: number; clearSelection: () => void }]>;
		children: Snippet;
	}

	let {
		items,
		pageSize = 10,
		striped = false,
		selectable = false,
		onSelectionChange,
		actionBar,
		class: className,
		children,
		...rest
	}: Props = $props();

	let sortColumn: string | null = $state(null);
	let sortDirection: 'asc' | 'desc' = $state('asc');
	let page: number = $state(1);
	let filters: Record<string, string> = $state({});
	let selectedItems: string[] = $state([]);
	let expandedRows: string[] = $state([]);
	let columnWidths: Record<string, number> = $state({});

	let filteredItems = $derived.by(() => {
		let result = items;
		for (const [column, value] of Object.entries(filters)) {
			if (value) {
				const lowerValue = value.toLowerCase();
				result = result.filter((item) => {
					const cellValue = item[column];
					if (cellValue == null) return false;
					return String(cellValue).toLowerCase().includes(lowerValue);
				});
			}
		}
		return result;
	});

	let sortedItems = $derived.by(() => {
		if (!sortColumn) return filteredItems;
		const col = sortColumn;
		const dir = sortDirection === 'asc' ? 1 : -1;
		return [...filteredItems].sort((a, b) => {
			const aVal = a[col];
			const bVal = b[col];
			if (aVal == null && bVal == null) return 0;
			if (aVal == null) return 1;
			if (bVal == null) return -1;
			if (typeof aVal === 'number' && typeof bVal === 'number') {
				return (aVal - bVal) * dir;
			}
			return String(aVal).localeCompare(String(bVal)) * dir;
		});
	});

	let totalItems = $derived(sortedItems.length);
	let totalPages = $derived(pageSize > 0 ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1);

	let pagedItems = $derived.by(() => {
		if (pageSize <= 0) return sortedItems;
		const start = (page - 1) * pageSize;
		return sortedItems.slice(start, start + pageSize);
	});

	$effect(() => {
		if (page > totalPages) {
			page = totalPages;
		}
	});

	function toggleSelect(id: string) {
		if (selectedItems.includes(id)) {
			selectedItems = selectedItems.filter((i) => i !== id);
		} else {
			selectedItems = [...selectedItems, id];
		}
		onSelectionChange?.(selectedItems);
	}

	function toggleSelectAll() {
		const pageIds = pagedItems.map((item) =>
			String((item as Record<string, unknown>).id ?? pagedItems.indexOf(item))
		);
		const allSelected = pageIds.every((id) => selectedItems.includes(id));
		if (allSelected) {
			selectedItems = selectedItems.filter((id) => !pageIds.includes(id));
		} else {
			const newIds = pageIds.filter((id) => !selectedItems.includes(id));
			selectedItems = [...selectedItems, ...newIds];
		}
		onSelectionChange?.(selectedItems);
	}

	function isSelected(id: string) {
		return selectedItems.includes(id);
	}

	function clearSelection() {
		selectedItems = [];
		onSelectionChange?.(selectedItems);
	}

	function toggleExpand(id: string) {
		if (expandedRows.includes(id)) {
			expandedRows = expandedRows.filter((i) => i !== id);
		} else {
			expandedRows = [...expandedRows, id];
		}
	}

	function isExpanded(id: string) {
		return expandedRows.includes(id);
	}

	function setColumnWidth(key: string, width: number) {
		columnWidths = { ...columnWidths, [key]: width };
	}

	setDataGridCtx({
		get sortColumn() {
			return sortColumn;
		},
		get sortDirection() {
			return sortDirection;
		},
		get page() {
			return page;
		},
		get pageSize() {
			return pageSize;
		},
		get totalItems() {
			return totalItems;
		},
		get totalPages() {
			return totalPages;
		},
		get filteredItems() {
			return sortedItems;
		},
		get pagedItems() {
			return pagedItems;
		},
		sort(column: string) {
			if (sortColumn === column) {
				sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
			} else {
				sortColumn = column;
				sortDirection = 'asc';
			}
		},
		setPage(p: number) {
			page = Math.max(1, Math.min(totalPages, p));
		},
		setFilter(column: string, value: string) {
			filters = { ...filters, [column]: value };
			page = 1;
		},
		getFilter(column: string) {
			return filters[column] ?? '';
		},
		get selectable() {
			return selectable;
		},
		get selectedItems() {
			return selectedItems;
		},
		toggleSelect,
		toggleSelectAll,
		isSelected,
		clearSelection,
		get expandedRows() {
			return expandedRows;
		},
		toggleExpand,
		isExpanded,
		get columnWidths() {
			return columnWidths;
		},
		setColumnWidth
	});
</script>

<div data-data-grid data-striped={striped ? '' : undefined} class={className} {...rest}>
	{@render children()}
	{#if actionBar && selectedItems.length > 0}
		<div data-part="action-bar" role="toolbar" aria-label="Selection actions">
			{@render actionBar({ selectedCount: selectedItems.length, clearSelection })}
		</div>
	{/if}
</div>

<style>
	[data-data-grid] {
		--dry-data-grid-border: var(--dry-color-stroke-weak);
		--dry-data-grid-header-bg: var(--dry-color-bg-raised);
		--dry-data-grid-row-hover: color-mix(in srgb, var(--dry-color-text-strong) 4%, transparent);
		--dry-data-grid-row-stripe: color-mix(in srgb, var(--dry-color-text-strong) 2%, transparent);
		--dry-data-grid-padding-x: var(--dry-space-3);
		--dry-data-grid-padding-y: var(--dry-space-3);
		--dry-data-grid-head-padding-y: var(--dry-space-2_5);
		--dry-data-grid-sort-color: var(--dry-color-fill-brand);
		--dry-data-grid-pagination-gap: var(--dry-space-2);

		display: grid;
		container-type: inline-size;
		overflow-x: auto;
	}

	@container (max-width: 400px) {
		[data-data-grid] {
			--dry-data-grid-padding-x: var(--dry-space-2);
			--dry-data-grid-padding-y: var(--dry-space-2);
			--dry-data-grid-head-padding-y: var(--dry-space-1_5);
		}
	}
</style>
