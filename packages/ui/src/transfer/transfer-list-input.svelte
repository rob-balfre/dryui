<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTransferCtx, type TransferItem } from './context.svelte.js';
	import { Checkbox } from '../checkbox/index.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		type: 'source' | 'target';
		title?: string;
		filterable?: boolean;
		content?: Snippet<[{ items: TransferItem[] }]>;
	}

	let { class: className, type, title, filterable = false, content, ...rest }: Props = $props();

	const ctx = getTransferCtx();

	let items = $derived(type === 'source' ? ctx.sourceItems : ctx.targetItems);
	let selectedSet = $derived(type === 'source' ? ctx.selectedSource : ctx.selectedTarget);
	let count = $derived(type === 'source' ? ctx.sourceCount : ctx.targetCount);
	let selectedCount = $derived(
		type === 'source' ? ctx.selectedSourceCount : ctx.selectedTargetCount
	);
	let allSelected = $derived(
		type === 'source' ? ctx.isSourceAllSelected() : ctx.isTargetAllSelected()
	);

	function toggleAll() {
		if (allSelected) {
			type === 'source' ? ctx.deselectAllSource() : ctx.deselectAllTarget();
		} else {
			type === 'source' ? ctx.selectAllSource() : ctx.selectAllTarget();
		}
	}

	function toggleItem(key: string) {
		type === 'source' ? ctx.toggleSourceSelection(key) : ctx.toggleTargetSelection(key);
	}

	let filterQuery = $state('');

	function filterItems(allItems: TransferItem[]): TransferItem[] {
		if (!filterable || !filterQuery) return allItems;
		const q = filterQuery.toLowerCase();
		return allItems.filter((i) => i.label.toLowerCase().includes(q));
	}
</script>

<div data-part="list" class={className}>
	{#if filterable}
		<input
			type="text"
			data-part="filter"
			placeholder="Search..."
			aria-label="Filter {type} items"
			bind:value={filterQuery}
		/>
	{/if}

	<div
		role="group"
		aria-label={title ?? (type === 'source' ? 'Available items' : 'Selected items')}
		data-transfer-list
		data-type={type}
		{...rest}
	>
		{#if title}
			<div data-transfer-list-header>
				<label data-transfer-select-all>
					<Checkbox
						checked={allSelected}
						indeterminate={selectedCount > 0 && !allSelected}
						onchange={toggleAll}
						aria-label="Select all {type} items"
						size="sm"
					/>
					<span>{title}</span>
				</label>
				<span data-transfer-count>
					{selectedCount}/{count}
				</span>
			</div>
		{/if}

		<div data-transfer-list-content>
			{#if content}
				{@render content({ items: filterItems(items) })}
			{:else}
				{#each filterItems(items) as item (item.key)}
					<label
						data-transfer-item
						data-disabled={item.disabled ? '' : undefined}
						data-selected={selectedSet.has(item.key) ? '' : undefined}
					>
						<Checkbox
							checked={selectedSet.has(item.key)}
							disabled={item.disabled}
							onchange={() => toggleItem(item.key)}
							size="sm"
						/>
						{item.label}
					</label>
				{/each}
			{/if}
		</div>
	</div>
</div>

<style>
	[data-part='list'] {
		border: 1px solid var(--dry-transfer-border, var(--dry-color-stroke-weak));
		border-radius: var(--dry-transfer-radius, var(--dry-radius-lg));
		background: var(--dry-transfer-bg, var(--dry-color-bg-base));
		overflow: hidden;
		display: grid;
	}

	[data-part='list'] [data-transfer-list-header] {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		padding: var(--dry-space-2_5) var(--dry-transfer-padding, var(--dry-space-3));
		background: var(--dry-transfer-header-bg, var(--dry-color-bg-raised));
		border-bottom: 1px solid var(--dry-transfer-border, var(--dry-color-stroke-weak));
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		font-weight: 500;
		color: var(--dry-color-text-strong);
	}

	[data-part='list'] [data-transfer-select-all] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content max-content;
		align-items: center;
		gap: var(--dry-space-2);
		cursor: pointer;
	}

	[data-part='list'] [data-transfer-count] {
		font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
		color: var(--dry-color-text-weak);
		font-variant-numeric: tabular-nums;
	}

	[data-part='list'] [data-transfer-list-content] {
		overflow-y: auto;
		max-height: var(--dry-transfer-list-height, 280px);
	}

	[data-part='list'] [data-transfer-item] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content max-content;
		align-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-space-2) var(--dry-transfer-padding, var(--dry-space-3));
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		color: var(--dry-color-text-strong);
		cursor: pointer;
		transition: background var(--dry-duration-fast) var(--dry-ease-default);
		border: none;
	}

	[data-part='list'] [data-transfer-item]:hover:not([data-disabled]) {
		background: var(--dry-transfer-item-hover, var(--dry-color-fill));
	}

	[data-part='list'] [data-transfer-item][data-selected] {
		background: var(--dry-transfer-item-selected, var(--dry-color-fill-brand-weak));
		color: var(--dry-color-text-brand);
		box-shadow: inset 0 0 0 1px var(--dry-color-stroke-selected);
	}

	[data-part='list'] [data-transfer-item][data-disabled] {
		background: var(--dry-color-bg-sunken);
		color: var(--dry-color-text-disabled);
		cursor: not-allowed;
	}

	[data-part='filter'] {
		display: grid;
		padding: var(--dry-space-2) var(--dry-transfer-padding, var(--dry-space-3));
		border: none;
		border-bottom: 1px solid var(--dry-transfer-border, var(--dry-color-stroke-weak));
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		font-family: var(--dry-font-sans);
		color: var(--dry-color-text-strong);
		background: var(--dry-transfer-bg, var(--dry-color-bg-base));
	}

	[data-part='filter']:focus {
		outline: none;
		background: var(--dry-color-fill-brand-weak);
		border-bottom-color: var(--dry-color-stroke-focus);
	}

	[data-part='filter']:focus-visible {
		outline: 2px solid var(--dry-color-stroke-focus);
		outline-offset: -2px;
	}

	[data-part='filter']::placeholder {
		color: var(--dry-color-text-weak);
	}
</style>
