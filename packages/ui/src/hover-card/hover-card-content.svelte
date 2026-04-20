<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Placement } from '@dryui/primitives';
	import { createAnchoredOverlayContent } from '../internal/anchored-overlay-content.svelte.js';
	import { getHoverCardCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placement?: Placement;
		offset?: number;
		children: Snippet;
	}

	let {
		placement = 'bottom',
		offset = 8,
		class: className,
		children,
		style,
		...rest
	}: Props = $props();

	const ctx = getHoverCardCtx();

	const overlay = createAnchoredOverlayContent({
		ctx,
		placement: () => placement,
		offset: () => offset,
		style: () => style,
		onContentChange: (contentEl) => {
			ctx.contentEl = contentEl;
		}
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			ctx.forceClose();
			ctx.ignoreNextTriggerFocusOpen = true;
			ctx.triggerEl?.focus();
		}
	}

	function handlePointerEnter() {
		ctx.contentHovered = true;
		ctx.showImmediate();
	}

	function handlePointerLeave() {
		ctx.contentHovered = false;
		ctx.close();
	}

	function handleFocusIn() {
		ctx.contentFocused = true;
		ctx.showImmediate();
	}

	function handleFocusOut() {
		ctx.contentFocused = false;
		ctx.close();
	}
</script>

<div
	{@attach overlay.bindContent}
	{@attach overlay.position}
	id={ctx.contentId}
	popover="manual"
	role="dialog"
	aria-labelledby={ctx.triggerId}
	data-hover-card-content
	data-state={ctx.open ? 'open' : 'closed'}
	onpointerenter={handlePointerEnter}
	onpointerleave={handlePointerLeave}
	onfocusin={handleFocusIn}
	onfocusout={handleFocusOut}
	onkeydown={handleKeydown}
	class={className}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-hover-card-content]:not(:popover-open) {
		display: none;
	}

	[data-hover-card-content]:popover-open {
		display: grid;
	}

	[data-hover-card-content] {
		--dry-hover-card-bg: var(--dry-color-bg-overlay);
		--dry-hover-card-border: var(--dry-color-stroke-weak);
		--dry-hover-card-radius: var(--dry-radius-lg);
		--dry-hover-card-shadow: var(--dry-shadow-lg);
		--dry-hover-card-padding: var(--dry-space-4);
		--dry-hover-card-min-width: 14rem;
		--dry-hover-card-max-width: min(22rem, calc(100vw - (var(--dry-space-6) * 2)));

		inset: unset;
		margin: 0;
		box-sizing: border-box;
		display: grid;
		grid-template-columns: minmax(var(--dry-hover-card-min-width), var(--dry-hover-card-max-width));
		background: var(--dry-hover-card-bg);
		color: var(--dry-color-text-strong);
		border: 1px solid var(--dry-hover-card-border);
		border-radius: var(--dry-hover-card-radius);
		box-shadow: var(--dry-hover-card-shadow);
		padding: var(--dry-hover-card-padding);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		line-height: var(--dry-type-small-leading, var(--dry-text-sm-leading));
		z-index: var(--dry-layer-overlay);
	}
</style>
