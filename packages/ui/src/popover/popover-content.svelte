<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createPositionedPopover } from '@dryui/primitives';
	import type { Placement } from '@dryui/primitives';
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

	let contentEl = $state<HTMLDivElement>();

	const popover = createPositionedPopover({
		triggerEl: () => ctx.triggerEl,
		contentEl: () => contentEl ?? null,
		placement: () => placement,
		offset: () => offset
	});

	$effect(() => {
		if (!contentEl) return;
		if (ctx.open) {
			popover.showPopover(contentEl);
		} else {
			popover.hidePopover(contentEl);
		}
	});

	$effect(() => {
		if (!ctx.open) return;

		function handlePointerDown(event: PointerEvent) {
			const target = event.target as Node;
			if (contentEl?.contains(target) || ctx.triggerEl?.contains(target)) {
				return;
			}
			ctx.close();
		}

		function handleKeydown(event: KeyboardEvent) {
			if (event.key !== 'Escape') return;
			event.preventDefault();
			ctx.close();
			ctx.triggerEl?.focus();
		}

		document.addEventListener('pointerdown', handlePointerDown);
		document.addEventListener('keydown', handleKeydown, true);

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown);
			document.removeEventListener('keydown', handleKeydown, true);
		};
	});
</script>

<div
	bind:this={contentEl}
	id={ctx.contentId}
	popover="manual"
	data-popover-content
	data-state={ctx.open ? 'open' : 'closed'}
	use:popover.applyPosition={style}
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
		--dry-radius-nested: max(0px, calc(var(--dry-popover-radius) - var(--dry-popover-padding)));

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
