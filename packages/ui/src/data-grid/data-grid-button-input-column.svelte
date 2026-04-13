<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
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
		class: className,
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
		if (sortable) ctx.sort(key);
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
			const w = columnWidth ? `${columnWidth}px` : '';
			node.style.setProperty('--dry-dg-col-width', w);
			node.style.width = w;
			node.style.minWidth = w;
		});
	}
</script>

<th
	bind:this={headerEl}
	scope="col"
	aria-sort={isSorted ? (direction === 'asc' ? 'ascending' : 'descending') : undefined}
	data-dg-column
	data-sortable={sortable ? '' : undefined}
	data-sorted={isSorted ? direction : undefined}
	data-pinned={pinned ? '' : undefined}
	data-resizable={resizable ? '' : undefined}
	class={className}
	use:applyColumnStyles
	{...rest}
>
	{#if sortable}
		<Button
			variant="bare"
			type="button"
			data-sort-trigger
			onclick={handleSort}
			onkeydown={handleKeydown}
		>
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
		</Button>
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

<style>
	[data-dg-column] {
		padding: var(--dry-data-grid-head-padding-y) var(--dry-data-grid-padding-x);
		text-align: left;
		font-weight: 500;
		font-size: var(--dry-type-tiny-size);
		line-height: var(--dry-type-tiny-leading);
		color: var(--dry-color-text-weak);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
	}

	[data-dg-column][data-sorted] {
		color: var(--dry-data-grid-sort-color);
	}

	[data-dg-column][data-pinned] {
		position: sticky;
		left: 0;
		z-index: 1;
		background: inherit;
		box-shadow: 2px 0 4px -2px rgb(15 23 42 / 0.1);
	}

	[data-dg-column][data-resizable] {
		position: relative;
	}

	[data-sort-indicator] {
		font-size: 0.65em;
		opacity: 0.4;
	}

	[data-dg-column][data-sorted] [data-sort-indicator] {
		opacity: 1;
	}

	[data-dg-column] input[data-filter-input] {
		display: grid;
		margin-top: var(--dry-space-1);
		padding: var(--dry-space-1) var(--dry-space-1_5);
		border: 1px solid var(--dry-data-grid-border);
		border-radius: var(--dry-radius-sm);
		font-size: var(--dry-type-tiny-size);
		font-family: var(--dry-font-sans);
		color: var(--dry-color-text-strong);
		background: var(--dry-color-bg-base);
		text-transform: none;
		letter-spacing: normal;
	}

	[data-dg-column] input[data-filter-input]:focus {
		outline: var(--dry-focus-ring);
		outline-offset: -1px;
		border-color: var(--dry-color-fill-brand);
	}

	[data-dg-column] input[data-filter-input]::placeholder {
		color: var(--dry-color-text-weak);
	}

	[data-dg-column] [data-part='resize-handle'] {
		position: absolute;
		top: 0;
		bottom: 0;
		right: 0;
		left: calc(100% - 4px);
		cursor: col-resize;
		background: transparent;
	}

	[data-dg-column] [data-part='resize-handle']:hover,
	[data-dg-column] [data-part='resize-handle'][data-resizing] {
		background: var(--dry-color-fill-brand, #3b82f6);
	}
</style>
