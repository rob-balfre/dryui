<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getMegaMenuCtx, getMegaMenuItemCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

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

<Button
	variant="trigger"
	type="button"
	id={itemCtx.triggerId}
	aria-expanded={itemCtx.open}
	aria-haspopup="true"
	data-mega-menu-trigger
	data-state={itemCtx.open ? 'open' : 'closed'}
	{...rest}
	onclick={handleClick}
	onkeydown={handleKeydown}
>
	{@render children()}
</Button>
