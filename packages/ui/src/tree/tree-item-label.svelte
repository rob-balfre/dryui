<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getTreeCtx, getTreeItemCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getTreeCtx();
	const itemCtx = getTreeItemCtx();
</script>

<button
	type="button"
	data-part="label"
	data-tree-label
	data-selected={ctx.isSelected(itemCtx.itemId) || undefined}
	class={className}
	onclick={() => {
		ctx.selectItem(itemCtx.itemId);
		ctx.toggleItem(itemCtx.itemId);
	}}
	{...rest}
>
	{@render children()}
</button>

<style>
	[data-part='label'] {
		appearance: none;
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
		cursor: pointer;
		user-select: none;
		outline: none;
		transition: background var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-part='label']:hover {
		background: var(--dry-tree-item-hover-bg, var(--dry-color-fill));
	}

	[data-part='label']:focus-visible {
		outline: var(--dry-focus-ring);
		outline-offset: 2px;
	}

	[data-part='label'][data-selected] {
		background: var(--dry-tree-item-selected-bg, var(--dry-color-fill-brand-weak));
		color: var(--dry-tree-item-selected-color, var(--dry-color-text-brand));
		box-shadow: inset 2px 0 0
			var(--dry-tree-item-selected-indicator, var(--dry-color-stroke-selected));
		font-weight: 600;
	}
</style>
