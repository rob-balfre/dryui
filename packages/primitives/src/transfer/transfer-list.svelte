<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTransferCtx, type TransferItem } from './context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		type: 'source' | 'target';
		title?: string | undefined;
		children?: Snippet<[{ items: TransferItem[] }]> | undefined;
	}

	let { type, title, children, ...rest }: Props = $props();

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
</script>

<div
	role="listbox"
	aria-label={title ?? (type === 'source' ? 'Available items' : 'Selected items')}
	aria-multiselectable="true"
	data-transfer-list
	data-type={type}
	{...rest}
>
	{#if title}
		<div data-transfer-list-header>
			<label data-transfer-select-all>
				<input
					type="checkbox"
					checked={allSelected}
					indeterminate={selectedCount > 0 && !allSelected}
					onchange={toggleAll}
					aria-label="Select all {type} items"
				/>
				<span>{title}</span>
			</label>
			<span data-transfer-count>
				{selectedCount}/{count}
			</span>
		</div>
	{/if}

	<div data-transfer-list-content>
		{#if children}
			{@render children({ items })}
		{:else}
			{#each items as item (item.key)}
				<div
					role="option"
					data-transfer-item
					data-disabled={item.disabled ? '' : undefined}
					data-selected={selectedSet.has(item.key) ? '' : undefined}
					aria-selected={selectedSet.has(item.key)}
					aria-disabled={item.disabled ?? false}
				>
					<label>
						<input
							type="checkbox"
							checked={selectedSet.has(item.key)}
							disabled={item.disabled}
							onchange={() => toggleItem(item.key)}
						/>
						<span>{item.label}</span>
					</label>
				</div>
			{/each}
		{/if}
	</div>
</div>
