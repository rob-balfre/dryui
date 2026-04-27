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

	let contentEl = $state<HTMLDivElement>();

	const overlay = createAnchoredOverlayContent({
		ctx,
		contentEl: () => contentEl ?? null,
		placement: () => placement,
		offset: () => offset
	});
</script>

<div
	bind:this={contentEl}
	use:overlay.applyPosition={style}
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

		background: var(
			--dry-tooltip-bg,
			color-mix(in srgb, var(--dry-color-bg-inverse) 95%, transparent)
		);
		color: var(--dry-tooltip-color, var(--dry-color-text-inverse));
		border: 1px solid var(--dry-tooltip-border, var(--dry-color-stroke-inverse-weak));
		border-radius: var(--dry-tooltip-radius, var(--dry-overlay-radius, var(--dry-radius-tooltip)));
		display: inline-grid;
		max-inline-size: 28ch;
		padding: var(--dry-tooltip-padding-y, var(--dry-space-1))
			var(--dry-tooltip-padding-x, var(--dry-padding-tooltip, var(--dry-space-2)));
		font-size: var(--dry-tooltip-font-size, var(--dry-type-ui-caption-size));
		font-weight: var(--dry-tooltip-font-weight, var(--dry-font-weight-medium));
		line-height: var(--dry-tooltip-line-height, var(--dry-type-ui-caption-leading));
		letter-spacing: var(--dry-tooltip-letter-spacing, var(--dry-tracking-normal));
		white-space: normal;
		overflow-wrap: anywhere;
		pointer-events: none;
		box-shadow: var(--dry-tooltip-shadow, var(--dry-overlay-shadow, var(--dry-shadow-overlay)));
		backdrop-filter: blur(var(--dry-tooltip-backdrop-blur, var(--dry-space-2)));
		-webkit-backdrop-filter: blur(var(--dry-tooltip-backdrop-blur, var(--dry-space-2)));

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
		display: inline-grid;
		opacity: 1;
		transform: translateY(0);
	}

	@starting-style {
		[data-tooltip-content]:popover-open {
			opacity: 0;
			transform: translateY(var(--dry-motion-distance-xs));
		}
	}
</style>
