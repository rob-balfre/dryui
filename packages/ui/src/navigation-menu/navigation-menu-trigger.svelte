<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getNavigationMenuCtx, getNavigationMenuItemCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getNavigationMenuCtx();
	const itemCtx = getNavigationMenuItemCtx();

	function handlePointerEnter() {
		ctx.openItem(itemCtx.itemId);
	}

	function handlePointerLeave() {
		ctx.closeItem();
	}

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
		} else if (e.key === 'Escape' && itemCtx.open) {
			e.preventDefault();
			ctx.closeItem();
		}
	}
</script>

<button
	type="button"
	id={itemCtx.triggerId}
	aria-controls={itemCtx.contentId}
	aria-expanded={itemCtx.open}
	data-state={itemCtx.open ? 'open' : 'closed'}
	data-nav-menu-trigger
	class={className}
	onpointerenter={handlePointerEnter}
	onpointerleave={handlePointerLeave}
	onclick={handleClick}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</button>

<style>
	[data-nav-menu-trigger] {
		display: inline-grid;
		place-items: center;
		min-height: var(--dry-space-12);
		padding: var(--dry-nav-menu-trigger-padding-y) var(--dry-nav-menu-trigger-padding-x);
		border: none;
		border-radius: var(--dry-radius-md);
		background: transparent;
		color: var(--dry-color-text-strong);
		font-family: var(--dry-font-sans);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		cursor: pointer;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-nav-menu-trigger]:hover {
		background: var(--dry-color-fill);
	}

	[data-nav-menu-trigger][data-state='open'] {
		background: var(--dry-color-fill-brand-weak);
		color: var(--dry-color-text-brand);
	}

	[data-nav-menu-trigger]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}
</style>
