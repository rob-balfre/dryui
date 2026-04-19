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
			ctx.openItem(itemCtx.itemId, itemCtx.triggerId);
		}
	}
</script>

<Button
	variant="trigger"
	type="button"
	id={itemCtx.triggerId}
	aria-controls={itemCtx.open ? itemCtx.panelId : undefined}
	aria-expanded={itemCtx.open}
	data-mega-menu-trigger
	data-state={itemCtx.open ? 'open' : 'closed'}
	{...rest}
	onclick={handleClick}
>
	{@render children()}
</Button>
