<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTreeCtx, getTreeItemCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getTreeCtx();
	const itemCtx = getTreeItemCtx();
</script>

<div
	data-part="label"
	data-selected={ctx.isSelected(itemCtx.itemId) || undefined}
	class={className}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-part='label'] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-tree-item-padding, var(--dry-space-1) var(--dry-space-2));
		border: 0;
		border-radius: var(--dry-tree-item-radius, var(--dry-radius-md));
		background: none;
		text-align: inherit;
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		font-family: var(--dry-font-sans);
		color: var(--dry-color-text-strong);
		outline: var(--dry-tree-item-focus-ring, none);
		outline-offset: var(--dry-tree-item-focus-offset, 0px);
		cursor: pointer;
		user-select: none;
		transition: background var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-part='label']:hover {
		background: var(--dry-tree-item-hover-bg, var(--dry-color-fill));
	}

	[data-part='label'][data-selected] {
		background: var(--dry-tree-item-selected-bg, var(--dry-color-fill-brand-weak));
		color: var(--dry-tree-item-selected-color, var(--dry-color-text-brand));
		box-shadow: inset 2px 0 0
			var(--dry-tree-item-selected-indicator, var(--dry-color-stroke-selected));
		font-weight: 600;
	}
</style>
