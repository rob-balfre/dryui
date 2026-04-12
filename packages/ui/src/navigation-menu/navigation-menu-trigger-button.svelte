<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getNavigationMenuCtx, getNavigationMenuItemCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

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

<Button
	variant="trigger"
	type="button"
	id={itemCtx.triggerId}
	aria-controls={itemCtx.contentId}
	aria-expanded={itemCtx.open}
	data-state={itemCtx.open ? 'open' : 'closed'}
	data-nav-menu-trigger
	{...rest}
	onpointerenter={handlePointerEnter}
	onpointerleave={handlePointerLeave}
	onclick={handleClick}
	onkeydown={handleKeydown}
>
	{@render children()}
</Button>
