<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fromAction } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createPositionedPopover } from '@dryui/primitives';
	import { getMegaMenuCtx, getMegaMenuItemCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		fullWidth?: boolean;
		align?: 'start' | 'center' | 'end';
		children: Snippet;
	}

	let {
		fullWidth = false,
		align = 'start',
		class: className,
		children,
		style,
		...rest
	}: Props = $props();

	const ctx = getMegaMenuCtx();
	const itemCtx = getMegaMenuItemCtx();

	let panelEl = $state<HTMLDivElement | null>(null);

	const popover = createPositionedPopover({
		triggerEl: () => document.getElementById(itemCtx.triggerId),
		contentEl: () => panelEl ?? null,
		placement: () => {
			if (align === 'center') return 'bottom';
			if (align === 'end') return 'bottom-end';
			return 'bottom-start';
		},
		offset: () => 4
	});

	function handlePointerEnter() {
		ctx.openItem(itemCtx.itemId);
	}

	function handlePointerLeave() {
		ctx.closeItem();
	}

	function attachPanel(node: HTMLDivElement) {
		panelEl = node;

		return () => {
			if (panelEl === node) {
				panelEl = null;
			}
		};
	}

	function syncPopover(isOpen: boolean) {
		return (node: HTMLDivElement) => {
			if (isOpen && !node.matches(':popover-open')) {
				popover.showPopover(node);
			} else if (!isOpen && node.matches(':popover-open')) {
				popover.hidePopover(node);
			}
		};
	}
</script>

{#if itemCtx.open}
	<div
		{@attach attachPanel}
		{@attach syncPopover(itemCtx.open)}
		{@attach fromAction(popover.applyPosition, () => style)}
		role="region"
		popover="manual"
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
		inset: unset;
		margin: 0;
		z-index: var(--dry-layer-overlay, 50);
		background: var(--dry-mega-menu-panel-bg, var(--dry-color-bg-overlay, white));
		border: 1px solid var(--dry-color-stroke-weak, #e2e8f0);
		border-radius: var(--dry-radius-lg, 0.5rem);
		box-shadow: var(--dry-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
		padding: var(--dry-space-4, 1rem);
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: start;
		gap: var(--dry-space-6, 1.5rem);
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
