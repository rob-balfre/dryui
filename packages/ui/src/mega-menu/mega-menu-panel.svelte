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
	let layout = $state<'columns' | 'stacked'>('columns');
	const STACK_THRESHOLD = 32 * 16;

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

	function watchLayout(node: HTMLDivElement) {
		const update = () => {
			const next = window.innerWidth < STACK_THRESHOLD ? 'stacked' : 'columns';
			if (next !== layout) layout = next;
		};
		update();
		window.addEventListener('resize', update);
		return () => window.removeEventListener('resize', update);
	}

	function handlePointerEnter() {
		ctx.openItem(itemCtx.itemId, itemCtx.triggerId);
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
		{@attach watchLayout}
		id={itemCtx.panelId}
		role="group"
		popover="manual"
		data-mega-menu-panel
		aria-labelledby={itemCtx.triggerId}
		data-state={itemCtx.open ? 'open' : 'closed'}
		data-full-width={fullWidth || undefined}
		data-layout={layout}
		class={className}
		onpointerenter={handlePointerEnter}
		onpointerleave={handlePointerLeave}
		{...rest}
	>
		{@render children()}
	</div>
{/if}

<style>
	@position-try --dry-mega-menu-panel-viewport-fit {
		position-area: none;
		inset-inline: 4vw;
		inset-block-start: anchor(bottom);
		margin-top: 0.5rem;
	}

	[data-mega-menu-panel] {
		inset: unset;
		margin: 0;
		z-index: var(--dry-layer-overlay, 50);
		background: var(--dry-mega-menu-panel-bg, var(--dry-color-bg-overlay, white));
		border: 1px solid var(--dry-color-stroke-weak, #e2e8f0);
		border-radius: var(--dry-radius-lg, 0.5rem);
		box-shadow: var(--dry-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
		padding: var(--dry-space-4, 1rem);
		/* dryui-allow width */
		max-inline-size: var(--dry-mega-menu-panel-max-width, min(92vw, 60rem));
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(var(--dry-mega-menu-panel-column-min, 12rem), max-content);
		align-items: start;
		gap: var(--dry-space-6, 1.5rem);
		--dry-anchor-try-fallbacks: flip-block, flip-inline, --dry-mega-menu-panel-viewport-fit;
	}

	[data-mega-menu-panel]:not(:popover-open) {
		display: none;
	}

	[data-mega-menu-panel]:popover-open {
		display: grid;
	}

	[data-mega-menu-panel][data-layout='stacked'] {
		grid-auto-flow: row;
		grid-auto-columns: auto;
		grid-auto-rows: auto;
		gap: var(--dry-space-4, 1rem);
	}

	[data-mega-menu-panel][data-full-width] {
		justify-self: stretch;
	}
</style>
