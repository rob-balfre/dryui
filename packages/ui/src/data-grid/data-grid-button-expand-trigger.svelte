<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getDataGridCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLButtonElement> {
		rowId: string;
		children?: Snippet;
	}

	let { rowId, children, ...rest }: Props = $props();

	const ctx = getDataGridCtx();

	let expanded = $derived(ctx.isExpanded(rowId));
</script>

<Button
	variant="trigger"
	size="icon-sm"
	type="button"
	data-expanded={expanded ? '' : undefined}
	aria-expanded={expanded}
	aria-label={expanded ? 'Collapse row' : 'Expand row'}
	onclick={() => ctx.toggleExpand(rowId)}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else}
		<span class="chevron" class:open={expanded} aria-hidden="true">&#9654;</span>
	{/if}
</Button>

<style>
	.chevron {
		display: inline-grid;
		transition: transform var(--dry-duration-fast) var(--dry-ease-default);
	}

	.chevron.open {
		transform: rotate(90deg);
	}
</style>
