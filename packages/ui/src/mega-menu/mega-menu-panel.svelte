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
		data-mega-menu-panel
		aria-labelledby={itemCtx.triggerId}
		data-state={itemCtx.open ? 'open' : 'closed'}
		data-full-width={fullWidth || undefined}
		class={className}
		onpointerenter={handlePointerEnter}
		onpointerleave={handlePointerLeave}
		{...rest}
	>
		{@render children()}
	</div>
{/if}

<style>
	[data-mega-menu-panel] {
		position: absolute;
		top: 100%;
		left: 0;
		z-index: var(--dry-layer-overlay, 50);
		background: var(--dry-color-bg-overlay, white);
		border: 1px solid var(--dry-color-stroke-weak, #e2e8f0);
		border-radius: var(--dry-radius-lg, 0.5rem);
		box-shadow: var(--dry-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
		padding: var(--dry-space-6, 1.5rem);
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: flex-start;
		gap: var(--dry-space-8, 2rem);
		margin-top: var(--dry-space-1, 0.25rem);
	}

	[data-mega-menu-panel][data-full-width] {
		left: 0;
		right: 0;
	}
</style>
