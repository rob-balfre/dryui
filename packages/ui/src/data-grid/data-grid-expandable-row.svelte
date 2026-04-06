<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDataGridCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLTableRowElement> {
		rowId: string;
		expandable: Snippet;
		children: Snippet;
	}

	let { rowId, expandable, class: className, children, ...rest }: Props = $props();

	const ctx = getDataGridCtx();

	let expanded = $derived(ctx.isExpanded(rowId));
	let selected = $derived(ctx.selectable ? ctx.isSelected(rowId) : false);
</script>

<tr
	data-dg-row
	data-expanded={expanded ? '' : undefined}
	data-selected={selected ? '' : undefined}
	class={className}
	{...rest}
>
	{@render children()}
</tr>
{#if expanded}
	<tr data-part="row-detail-row">
		<td data-part="row-detail" colspan="999">
			{@render expandable()}
		</td>
	</tr>
{/if}

<style>
	[data-dg-row] {
		border-bottom: 1px solid var(--dry-data-grid-border);
		transition: background var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-dg-row]:hover {
		background: var(--dry-data-grid-row-hover);
	}

	[data-dg-row][data-expanded] {
		border-bottom: none;
	}

	[data-dg-row][data-selected] {
		background: var(--dry-color-fill-brand-weak, rgba(59, 130, 246, 0.05));
	}

	[data-dg-row][data-selected]:hover {
		background: var(--dry-color-fill-brand-weak, rgba(59, 130, 246, 0.08));
	}
</style>
