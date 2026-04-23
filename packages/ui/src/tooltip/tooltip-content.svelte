<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { type Placement } from '@dryui/primitives';
	import { createAnchoredOverlayContent } from '../internal/anchored-overlay-content.svelte.js';
	import { getTooltipCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placement?: Placement;
		offset?: number;
		children: Snippet;
	}

	let {
		placement = 'top',
		offset = 8,
		class: className,
		children,
		style,
		...rest
	}: Props = $props();

	const ctx = getTooltipCtx();

	const overlay = createAnchoredOverlayContent({
		ctx,
		placement: () => placement,
		offset: () => offset,
		style: () => style
	});
</script>

<div
	{@attach overlay.bindContent}
	{@attach overlay.position}
	id={ctx.contentId}
	role="tooltip"
	popover="manual"
	data-tooltip-content
	data-state={ctx.open ? 'open' : 'closed'}
	class={className}
	{...rest}
>
	{@render children()}
</div>

<style>
	/* outer: var(--dry-radius-tooltip); children inside the padded region use var(--dry-radius-nested-tooltip). */
	[data-tooltip-content] {
		/* Reset UA popover defaults */
		inset: unset;
		margin: 0;

		background: var(--dry-tooltip-bg, var(--dry-color-bg-inverse));
		color: var(--dry-tooltip-color, var(--dry-color-text-inverse));
		border: 1px solid var(--dry-tooltip-border, var(--dry-color-stroke-inverse-weak));
		border-radius: var(--dry-tooltip-radius, var(--dry-overlay-radius, var(--dry-radius-tooltip)));
		display: grid;
		grid-template-columns: minmax(0, min(28ch, calc(100vw - var(--dry-space-8))));
		padding: var(--dry-tooltip-padding-y, var(--dry-space-6))
			var(--dry-tooltip-padding-x, var(--dry-space-8));
		font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
		line-height: var(--dry-type-tiny-leading, var(--dry-text-xs-leading));
		white-space: normal;
		overflow-wrap: anywhere;
		pointer-events: none;
		box-shadow: var(--dry-tooltip-shadow, var(--dry-overlay-shadow, var(--dry-shadow-overlay)));

		transition:
			opacity var(--dry-duration-fast) var(--dry-ease-emphasized),
			transform var(--dry-duration-fast) var(--dry-ease-emphasized);
	}

	[data-tooltip-content][data-state='closed'] {
		transition-duration: calc(var(--dry-duration-fast) / 2);
		transition-timing-function: var(--dry-ease-out);
	}

	[data-tooltip-content]:not(:popover-open) {
		display: none;
	}

	[data-tooltip-content]:popover-open {
		display: grid;
		opacity: 1;
		transform: translateY(0);
	}

	@starting-style {
		[data-tooltip-content]:popover-open {
			opacity: 0;
			transform: translateY(calc(var(--dry-motion-distance-xs) * 0.5));
		}
	}
</style>
