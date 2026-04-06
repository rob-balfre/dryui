<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getMegaMenuCtx, getMegaMenuItemCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		fullWidth?: boolean;
		children: Snippet;
	}

	let { fullWidth = false, class: className, children, ...rest }: Props = $props();

	const ctx = getMegaMenuCtx();
	const itemCtx = getMegaMenuItemCtx();

	function handlePointerEnter() {
		ctx.openItem(itemCtx.itemId);
	}

	function handlePointerLeave() {
		ctx.closeItem();
	}
</script>

{#if itemCtx.open}
	<div
		role="region"
		class={className}
		aria-labelledby={itemCtx.triggerId}
		data-state={itemCtx.open ? 'open' : 'closed'}
		data-full-width={fullWidth || undefined}
		onpointerenter={handlePointerEnter}
		onpointerleave={handlePointerLeave}
		{...rest}
	>
		{@render children()}
	</div>
{/if}
