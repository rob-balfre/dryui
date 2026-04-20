<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Placement } from '@dryui/primitives';
	import { createAnchoredOverlayContent } from '../internal/anchored-overlay-content.svelte.js';
	import { getLinkPreviewCtx } from './context.svelte.js';

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

	const ctx = getLinkPreviewCtx();

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
	data-link-preview-content
	data-state={ctx.open ? 'open' : 'closed'}
	onmouseenter={() => ctx.showImmediate()}
	onmouseleave={() => ctx.close()}
	class={className}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-link-preview-content] {
		--dry-link-preview-bg: var(--dry-color-bg-overlay);
		--dry-link-preview-border: var(--dry-color-stroke-weak);
		--dry-link-preview-radius: var(--dry-radius-lg);
		--dry-link-preview-shadow: var(--dry-shadow-lg);
		--dry-link-preview-padding: var(--dry-space-4);

		inset: unset;
		margin: 0;
		display: grid;
		grid-template-columns: minmax(16rem, 24rem);
		padding: var(--dry-link-preview-padding);
		border: 1px solid var(--dry-link-preview-border);
		border-radius: var(--dry-link-preview-radius);
		background: var(--dry-link-preview-bg);
		color: var(--dry-color-text-strong);
		box-shadow: var(--dry-link-preview-shadow);
		line-height: 1.55;
		overflow: hidden;
		transition:
			opacity var(--dry-duration-fast) var(--dry-ease-out),
			transform var(--dry-duration-fast) var(--dry-ease-out);
	}

	[data-link-preview-content]:not(:popover-open) {
		display: none;
	}

	[data-link-preview-content]:popover-open {
		display: grid;
		opacity: 1;
		transform: scale(1);
	}

	@starting-style {
		[data-link-preview-content]:popover-open {
			opacity: 0;
			transform: scale(0.96);
		}
	}
</style>
