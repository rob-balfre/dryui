<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDataGridCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLTableCellElement> {
		rowId: string;
		rowLabel?: string;
	}

	let { rowId, rowLabel, ...rest }: Props = $props();

	const ctx = getDataGridCtx();

	let selected = $derived(ctx.isSelected(rowId));
	const selectionLabel = $derived(`Select row ${rowLabel ?? rowId}`);
</script>

<td role="gridcell" data-part="select-cell" {...rest}>
	<input
		type="checkbox"
		checked={selected}
		onchange={() => ctx.toggleSelect(rowId)}
		aria-label={selectionLabel}
	/>
</td>
