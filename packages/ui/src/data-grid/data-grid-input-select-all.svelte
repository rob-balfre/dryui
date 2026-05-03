<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDataGridCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLTableCellElement> {}

	let { class: className, ...rest }: Props = $props();

	const ctx = getDataGridCtx();

	let allPageSelected = $derived.by(() => {
		if (ctx.pagedItems.length === 0) return false;
		const pageIds = (ctx.pagedItems as Record<string, unknown>[]).map((item, i) =>
			String(item.id ?? i)
		);
		return pageIds.every((id) => ctx.isSelected(id));
	});

	let somePageSelected = $derived.by(() => {
		if (ctx.pagedItems.length === 0) return false;
		const pageIds = (ctx.pagedItems as Record<string, unknown>[]).map((item, i) =>
			String(item.id ?? i)
		);
		const selectedCount = pageIds.filter((id) => ctx.isSelected(id)).length;
		return selectedCount > 0 && selectedCount < pageIds.length;
	});
</script>

<th scope="col" data-dg-select-cell data-part="select-cell" class={className} {...rest}>
	<input
		type="checkbox"
		checked={allPageSelected}
		indeterminate={somePageSelected}
		onchange={() => ctx.toggleSelectAll()}
		aria-label="Select all rows"
	/>
</th>

<style>
	[data-dg-select-cell] {
		padding: var(--dry-space-2);
		display: grid;
		place-items: center;
	}

	[data-dg-select-cell] input[type='checkbox'] {
		aspect-ratio: 1;
		height: 1rem;
		cursor: pointer;
		accent-color: var(--dry-color-fill-brand);
	}
</style>
