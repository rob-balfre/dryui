<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getNavigationMenuCtx, getNavigationMenuItemCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
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
</script>

{#if itemCtx.open}
	<div
		id={itemCtx.contentId}
		role="region"
		aria-labelledby={itemCtx.triggerId}
		data-state={itemCtx.open ? 'open' : 'closed'}
		data-nav-menu-content
		class={className}
		onpointerenter={handlePointerEnter}
		onpointerleave={handlePointerLeave}
		{...rest}
	>
		{@render children()}
	</div>
{/if}

<style>
	[data-nav-menu-content] {
		position: absolute;
		inset-block-start: calc(100% + var(--dry-space-2));
		inset-inline-start: 0;
		z-index: 20;
		display: grid;
		grid-template-columns: minmax(16rem, max-content);
		gap: var(--dry-space-1);
		padding: var(--dry-nav-menu-content-padding);
		background: var(--dry-nav-menu-content-bg);
		border: 1px solid var(--dry-nav-menu-content-border);
		border-radius: var(--dry-nav-menu-content-radius);
		box-shadow: var(--dry-nav-menu-content-shadow);
	}
</style>
