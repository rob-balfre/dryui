<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDataGridCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLButtonElement> {
		rowId: string;
		children?: Snippet;
	}

	let { rowId, children, ...rest }: Props = $props();

	const ctx = getDataGridCtx();

	let expanded = $derived(ctx.isExpanded(rowId));
</script>

<button
	type="button"
	data-part="expand-trigger"
	data-expanded={expanded ? '' : undefined}
	aria-expanded={expanded}
	aria-label={expanded ? 'Collapse row' : 'Expand row'}
	onclick={() => ctx.toggleExpand(rowId)}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else}
		<span aria-hidden="true">&#9654;</span>
	{/if}
</button>
