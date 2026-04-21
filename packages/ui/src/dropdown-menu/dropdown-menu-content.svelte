<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fromAction } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createAnchoredPopover, createMenuNavigation } from '@dryui/primitives';
	import type { Placement } from '@dryui/primitives';
	import { getDropdownMenuCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placement?: Placement;
		offset?: number;
		children: Snippet;
	}

	let {
		class: className,
		placement = 'bottom-start',
		offset = 8,
		children,
		style,
		...rest
	}: Props = $props();

	const ctx = getDropdownMenuCtx();

	let el = $state<HTMLDivElement | null>(null);

	function attachContent(node: HTMLDivElement) {
		el = node;

		return () => {
			if (el === node) {
				el = null;
			}
		};
	}

	const popover = createAnchoredPopover({
		triggerEl: () => ctx.triggerEl,
		contentEl: () => el ?? null,
		open: () => ctx.open,
		placement: () => placement,
		offset: () => offset
	});

	const menu = createMenuNavigation({
		container: () => el ?? null,
		orientation: 'vertical'
	});
</script>

<div
	{@attach attachContent}
	{@attach fromAction(popover.applyPosition, () => style)}
	popover="auto"
	role="menu"
	tabindex="-1"
	id={ctx.contentId}
	aria-labelledby={ctx.triggerId}
	data-dropdown-menu-content
	data-dry-stagger
	data-state={ctx.open ? 'open' : 'closed'}
	class={className}
	ontoggle={(e) => {
		const newState = (e as ToggleEvent).newState === 'open';
		if (newState && !ctx.open) {
			ctx.show();
			queueMicrotask(() => menu.focusFirst());
		} else if (!newState && ctx.open) {
			ctx.close();
		}
	}}
	onkeydown={(e) => menu.handleKeydown(e)}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-dropdown-menu-content] {
		/* Reset UA popover defaults */
		inset: unset;
		margin: 0;

		--dry-menu-item-padding: var(--dry-space-3) var(--dry-space-4);
		background: var(--dry-menu-bg, var(--dry-overlay-bg, var(--dry-color-bg-overlay)));
		color: var(--dry-color-text-strong);
		border: 1px solid
			var(--dry-menu-border, var(--dry-overlay-border, var(--dry-color-stroke-weak)));
		border-radius: var(--dry-menu-radius, var(--dry-overlay-radius, var(--dry-radius-lg)));
		box-shadow: var(--dry-menu-shadow, var(--dry-overlay-shadow, var(--dry-shadow-overlay)));
		display: grid;
		grid-template-columns: minmax(12rem, auto);
		padding: var(--dry-menu-padding, var(--dry-space-2));
		--dry-radius-nested: max(
			var(--dry-radius-sm),
			calc(
				var(--dry-menu-radius, var(--dry-radius-lg)) - var(--dry-menu-padding, var(--dry-space-2))
			)
		);
		--dry-btn-radius: var(--dry-radius-nested);

		transition:
			opacity var(--dry-duration-fast) var(--dry-ease-emphasized),
			transform var(--dry-duration-fast) var(--dry-ease-emphasized);
	}

	[data-dropdown-menu-content][data-state='closed'] {
		transition-duration: calc(var(--dry-duration-fast) / 2);
		transition-timing-function: var(--dry-ease-out);
	}

	[data-dropdown-menu-content]:not(:popover-open) {
		display: none;
	}

	[data-dropdown-menu-content]:popover-open {
		display: grid;
		opacity: 1;
		transform: scale(1) translateY(0);
	}

	@starting-style {
		[data-dropdown-menu-content]:popover-open {
			opacity: 0;
			transform: scale(var(--dry-motion-scale-enter))
				translateY(calc(var(--dry-motion-distance-xs) * -1));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		[data-dropdown-menu-content] {
			transition: none;
		}
	}
</style>
