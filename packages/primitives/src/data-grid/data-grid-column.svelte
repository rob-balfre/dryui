<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDataGridCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLTableCellElement> {
		key: string;
		sortable?: boolean;
		filterable?: boolean;
		pinned?: boolean;
		resizable?: boolean;
		header?: Snippet;
		children: Snippet;
	}

	let {
		key,
		sortable = false,
		filterable = false,
		pinned = false,
		resizable = false,
		header,
		children,
		...rest
	}: Props = $props();

	const ctx = getDataGridCtx();

	let isSorted = $derived(ctx.sortColumn === key);
	let direction = $derived(isSorted ? ctx.sortDirection : null);
	let columnWidth = $derived(ctx.columnWidths[key]);
	let headerEl = $state<HTMLTableCellElement>();
	let resizeHandleValue = $derived(
		Math.round(columnWidth ?? headerEl?.getBoundingClientRect().width ?? 0)
	);
	let resizing = $state(false);

	const MIN_COLUMN_WIDTH = 50;
	const RESIZE_STEP = 16;

	function resizeColumn(nextWidth: number) {
		ctx.setColumnWidth(key, Math.max(MIN_COLUMN_WIDTH, nextWidth));
	}

	function resizeBy(delta: number) {
		resizeColumn(
			(columnWidth ?? headerEl?.getBoundingClientRect().width ?? MIN_COLUMN_WIDTH) + delta
		);
	}

	function handleSort() {
		if (sortable) {
			ctx.sort(key);
		}
	}

	function handleFilterInput(e: Event) {
		const target = e.target as HTMLInputElement;
		ctx.setFilter(key, target.value);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (sortable && (e.key === 'Enter' || e.key === ' ')) {
			e.preventDefault();
			ctx.sort(key);
		}
	}

	function handleResizeStart(e: PointerEvent) {
		if (!resizable) return;
		e.preventDefault();
		resizing = true;

		const startX = e.clientX;
		const startWidth = headerEl?.getBoundingClientRect().width ?? MIN_COLUMN_WIDTH;

		function onPointerMove(ev: PointerEvent) {
			const delta = ev.clientX - startX;
			resizeColumn(startWidth + delta);
		}

		function onPointerUp() {
			resizing = false;
			document.removeEventListener('pointermove', onPointerMove);
			document.removeEventListener('pointerup', onPointerUp);
		}

		document.addEventListener('pointermove', onPointerMove);
		document.addEventListener('pointerup', onPointerUp);
	}

	function handleResizeKeydown(event: KeyboardEvent) {
		if (!resizable) return;

		const step = event.shiftKey ? RESIZE_STEP * 2 : RESIZE_STEP;

		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			resizeBy(-step);
			return;
		}

		if (event.key === 'ArrowRight') {
			event.preventDefault();
			resizeBy(step);
		}
	}

	function applyColumnStyles(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('width', columnWidth ? `${columnWidth}px` : '');
			node.style.setProperty('min-width', columnWidth ? `${columnWidth}px` : '');
			node.style.setProperty('position', pinned ? 'sticky' : '');
			node.style.setProperty('left', pinned ? '0' : '');
			node.style.setProperty('z-index', pinned ? '1' : '');
		});
	}
</script>

<th
	bind:this={headerEl}
	scope="col"
	aria-sort={isSorted ? (direction === 'asc' ? 'ascending' : 'descending') : undefined}
	data-sortable={sortable ? '' : undefined}
	data-sorted={isSorted ? direction : undefined}
	data-pinned={pinned ? '' : undefined}
	data-resizable={resizable ? '' : undefined}
	use:applyColumnStyles
	{...rest}
>
	{#if sortable}
		<button type="button" onclick={handleSort} onkeydown={handleKeydown} data-sort-trigger>
			{#if header}
				{@render header()}
			{:else}
				{@render children()}
			{/if}
			<span data-sort-indicator aria-hidden="true">
				{#if isSorted && direction === 'asc'}
					&#9650;
				{:else if isSorted && direction === 'desc'}
					&#9660;
				{:else}
					&#9650;&#9660;
				{/if}
			</span>
		</button>
	{:else if header}
		{@render header()}
	{:else}
		{@render children()}
	{/if}

	{#if filterable}
		<input
			type="text"
			data-filter-input
			placeholder="Filter..."
			value={ctx.getFilter(key)}
			oninput={handleFilterInput}
			aria-label={`Filter ${key}`}
		/>
	{/if}

	{#if resizable}
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			tabindex="0"
			role="separator"
			aria-label={`Resize ${key} column`}
			aria-orientation="vertical"
			aria-valuemin={MIN_COLUMN_WIDTH}
			aria-valuenow={resizeHandleValue}
			data-part="resize-handle"
			data-resizing={resizing ? '' : undefined}
			onpointerdown={handleResizeStart}
			onkeydown={handleResizeKeydown}
		></div>
	{/if}
</th>
