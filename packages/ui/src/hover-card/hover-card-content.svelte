<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createAnchoredPopover } from '@dryui/primitives';
	import type { Placement } from '@dryui/primitives';
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

	let contentEl = $state<HTMLDivElement>();

	const popover = createAnchoredPopover({
		triggerEl: () => ctx.triggerEl,
		contentEl: () => contentEl ?? null,
		open: () => ctx.open,
		placement: () => placement,
		offset: () => offset
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			ctx.close();
		}
	}
</script>

<div
	bind:this={contentEl}
	id={ctx.contentId}
	popover="manual"
	data-hover-card-content
	data-state={ctx.open ? 'open' : 'closed'}
	use:popover.applyPosition={style}
	onpointerenter={() => ctx.show()}
	onpointerleave={() => ctx.close()}
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
