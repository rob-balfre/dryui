<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDataGridCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLButtonElement> {
		rowId: string;
		children?: Snippet;
	}

	let { rowId, class: className, children, ...rest }: Props = $props();

	const ctx = getDataGridCtx();

	let expanded = $derived(ctx.isExpanded(rowId));
</script>

<button
	type="button"
	data-dg-expand
	data-part="expand-trigger"
	data-expanded={expanded ? '' : undefined}
	aria-expanded={expanded}
	aria-label={expanded ? 'Collapse row' : 'Expand row'}
	class={className}
	onclick={() => ctx.toggleExpand(rowId)}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else}
		<span aria-hidden="true">&#9654;</span>
	{/if}
</button>

<style>
	[data-dg-expand] {
		display: inline-grid;
		place-items: center;
		aspect-ratio: 1;
		height: 1.5rem;
		padding: 0;
		border: none;
		background: none;
		cursor: pointer;
		color: var(--dry-color-text-weak);
		border-radius: var(--dry-radius-sm);
		transition:
			transform var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-dg-expand]:hover {
		color: var(--dry-color-text-strong);
	}

	[data-dg-expand]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}

	[data-dg-expand][data-expanded] {
		transform: rotate(90deg);
	}
</style>
