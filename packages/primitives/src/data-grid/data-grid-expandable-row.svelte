<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDataGridCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLTableRowElement> {
		rowId: string;
		expandable: Snippet;
		children: Snippet;
	}

	let { rowId, expandable, children, ...rest }: Props = $props();

	const ctx = getDataGridCtx();

	let expanded = $derived(ctx.isExpanded(rowId));
	let selected = $derived(ctx.selectable ? ctx.isSelected(rowId) : false);
</script>

<tr data-expanded={expanded ? '' : undefined} data-selected={selected ? '' : undefined} {...rest}>
	{@render children()}
</tr>
{#if expanded}
	<tr data-part="row-detail-row">
		<td data-part="row-detail" colspan="999">
			{@render expandable()}
		</td>
	</tr>
{/if}
