<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDataGridCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLTableCellElement> {
		rowId: string;
		rowLabel?: string;
	}

	let { rowId, rowLabel, class: className, ...rest }: Props = $props();

	const ctx = getDataGridCtx();

	let selected = $derived(ctx.isSelected(rowId));
	const selectionLabel = $derived(`Select row ${rowLabel ?? rowId}`);
</script>

<td role="gridcell" data-dg-select-cell data-part="select-cell" class={className} {...rest}>
	<input
		type="checkbox"
		checked={selected}
		onchange={() => ctx.toggleSelect(rowId)}
		aria-label={selectionLabel}
	/>
</td>

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
		accent-color: var(--dry-color-fill-brand, #3b82f6);
	}
</style>
