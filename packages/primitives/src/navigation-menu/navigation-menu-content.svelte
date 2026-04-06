<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getNavigationMenuCtx, getNavigationMenuItemCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
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
</script>

{#if itemCtx.open}
	<div
		id={itemCtx.contentId}
		role="region"
		aria-labelledby={itemCtx.triggerId}
		data-state={itemCtx.open ? 'open' : 'closed'}
		onpointerenter={handlePointerEnter}
		onpointerleave={handlePointerLeave}
		{...rest}
	>
		{@render children()}
	</div>
{/if}
