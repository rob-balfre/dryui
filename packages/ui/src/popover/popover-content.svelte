<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createDismiss } from '@dryui/primitives';
	import type { Placement } from '@dryui/primitives';
	import { createAnchoredOverlayContent } from '../internal/anchored-overlay-content.svelte.js';
	import { getPopoverCtx } from './context.svelte.js';

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

	const ctx = getPopoverCtx();

	const overlay = createAnchoredOverlayContent({
		ctx,
		placement: () => placement,
		offset: () => offset,
		style: () => style
	});

	createDismiss({
		enabled: () => ctx.open,
		onDismiss: () => ctx.close(),
		contentEl: overlay.contentEl,
		triggerEl: () => ctx.triggerEl,
		preventDefaultOnEscape: true,
		returnFocusTo: () => ctx.triggerEl
	});
</script>

<div
	{@attach overlay.bindContent}
	{@attach overlay.position}
	id={ctx.contentId}
	popover="manual"
	data-popover-content
	data-state={ctx.open ? 'open' : 'closed'}
	class={className}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-popover-content] {
		--dry-popover-bg: var(--dry-overlay-bg, var(--dry-color-bg-overlay));
		--dry-popover-border: var(--dry-overlay-border, var(--dry-color-stroke-weak));
		--dry-popover-radius: var(--dry-overlay-radius, var(--dry-radius-lg));
		--dry-popover-shadow: var(--dry-overlay-shadow, var(--dry-shadow-lg));
		--dry-popover-padding: var(--dry-space-4);
		--dry-radius-nested: max(
			var(--dry-radius-sm),
			calc(var(--dry-popover-radius) - var(--dry-popover-padding))
		);
		--dry-btn-radius: var(--dry-radius-nested);

		inset: unset;
		margin: 0;

		display: grid;
		grid-template-columns: minmax(12rem, max-content);
		background: var(--dry-popover-bg);
		color: var(--dry-color-text-strong);
		border: 1px solid var(--dry-popover-border);
		border-radius: var(--dry-popover-radius);
		box-shadow: var(--dry-popover-shadow);
		padding: var(--dry-popover-padding);

		transition:
			opacity var(--dry-duration-fast) var(--dry-ease-emphasized),
			transform var(--dry-duration-fast) var(--dry-ease-emphasized);
	}

	[data-popover-content][data-state='closed'] {
		transition-duration: calc(var(--dry-duration-fast) / 2);
		transition-timing-function: var(--dry-ease-out);
	}

	[data-popover-content]:not(:popover-open) {
		display: none;
	}

	[data-popover-content]:popover-open {
		display: grid;
		opacity: 1;
		transform: scale(1) translateY(0);
	}

	@starting-style {
		[data-popover-content]:popover-open {
			opacity: 0;
			transform: scale(var(--dry-motion-scale-enter))
				translateY(calc(var(--dry-motion-distance-xs) * -1));
		}
	}
</style>
