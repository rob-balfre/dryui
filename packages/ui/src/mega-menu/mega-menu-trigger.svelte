<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getMegaMenuCtx, getMegaMenuItemCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getMegaMenuCtx();
	const itemCtx = getMegaMenuItemCtx();

	function handleClick() {
		if (itemCtx.open) {
			ctx.closeItem();
		} else {
			ctx.openItem(itemCtx.itemId);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			if (itemCtx.open) {
				ctx.closeItem();
			} else {
				ctx.openItem(itemCtx.itemId);
			}
		}
	}
</script>

<button
	type="button"
	data-mega-menu-trigger
	id={itemCtx.triggerId}
	aria-expanded={itemCtx.open}
	aria-haspopup="true"
	data-active={itemCtx.open || undefined}
	data-state={itemCtx.open ? 'open' : 'closed'}
	class={className}
	onclick={handleClick}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</button>

<style>
	[data-mega-menu-trigger] {
		all: unset;
		cursor: pointer;
		padding: var(--dry-space-2, 0.5rem) var(--dry-space-3, 0.75rem);
		font-size: var(--dry-type-ui-control-size, var(--dry-text-sm-size, 0.875rem));
		font-weight: 500;
		color: var(--dry-color-text-strong, #1a1a2e);
		border-radius: var(--dry-radius-md, 0.375rem);
		transition:
			background var(--dry-duration-fast, 100ms) ease,
			color var(--dry-duration-fast, 100ms) ease;
	}

	[data-mega-menu-trigger]:hover,
	[data-mega-menu-trigger][data-active] {
		background: var(--dry-color-fill, #f3f4f6);
		color: var(--dry-color-fill-brand, #3b82f6);
	}
</style>
