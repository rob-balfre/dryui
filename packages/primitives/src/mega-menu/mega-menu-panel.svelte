<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fromAction } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createAnchoredPopover } from '../utils/anchored-popover.svelte.js';
	import { getMegaMenuCtx, getMegaMenuItemCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		fullWidth?: boolean;
		children: Snippet;
	}

	let { fullWidth = false, class: className, children, style, ...rest }: Props = $props();

	const ctx = getMegaMenuCtx();
	const itemCtx = getMegaMenuItemCtx();

	let panelEl = $state<HTMLDivElement | null>(null);

	function attachPanel(node: HTMLDivElement) {
		panelEl = node;

		return () => {
			if (panelEl === node) {
				panelEl = null;
			}
		};
	}

	const popover = createAnchoredPopover({
		triggerEl: () => document.getElementById(itemCtx.triggerId),
		contentEl: () => panelEl ?? null,
		open: () => itemCtx.open,
		placement: () => 'bottom-start',
		offset: () => 4
	});

	function handlePointerEnter() {
		ctx.openItem(itemCtx.itemId, itemCtx.triggerId);
	}

	function handlePointerLeave() {
		ctx.closeItem();
	}
</script>

{#if itemCtx.open}
	<div
		{@attach attachPanel}
		{@attach fromAction(popover.applyPosition, () => style)}
		id={itemCtx.panelId}
		role="group"
		popover="manual"
		class={className}
		aria-labelledby={itemCtx.triggerId}
		data-mega-menu-panel
		data-state={itemCtx.open ? 'open' : 'closed'}
		data-full-width={fullWidth || undefined}
		onpointerenter={handlePointerEnter}
		onpointerleave={handlePointerLeave}
		{...rest}
	>
		{@render children()}
	</div>
{/if}

<style>
	[data-mega-menu-panel] {
		inset: unset;
		margin: 0;
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
	}

	[data-mega-menu-panel]:not(:popover-open) {
		display: none;
	}

	[data-mega-menu-panel]:popover-open {
		display: grid;
	}

	[data-mega-menu-panel][data-full-width] {
		justify-self: stretch;
	}
</style>
