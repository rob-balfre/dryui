<script lang="ts">
	import { fromAction } from 'svelte/attachments';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createAnchoredPopover, type Placement } from '@dryui/primitives';
	import { getDatePickerCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placement?: Placement;
		offset?: number;
		children: Snippet;
	}

	let {
		placement = 'bottom-start',
		offset = 8,
		children,
		style,
		class: className,
		...rest
	}: Props = $props();

	const ctx = getDatePickerCtx();

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
</script>

<div
	{@attach attachContent}
	{@attach fromAction(popover.applyPosition, () => style)}
	popover="auto"
	role="dialog"
	id={ctx.contentId}
	aria-labelledby={ctx.triggerId}
	data-state={ctx.open ? 'open' : 'closed'}
	data-dp-content
	class={className}
	ontoggle={(e) => {
		const newState = (e as ToggleEvent).newState === 'open';
		if (newState && !ctx.open) {
			ctx.show();
		} else if (!newState && ctx.open) {
			ctx.close();
		}
	}}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-dp-content] {
		inset: unset;
		margin: 0;
		display: inline-grid;

		background: var(--dry-color-bg-overlay);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		box-shadow: var(--dry-shadow-lg);
		padding: var(--dry-space-3);
	}

	[data-dp-content]:not(:popover-open) {
		display: none;
	}

	[data-dp-content]:popover-open {
		display: inline-grid;
		opacity: 1;
		transform: scale(1) translateY(0);
	}

	@starting-style {
		[data-dp-content]:popover-open {
			opacity: 0;
			transform: scale(var(--dry-motion-scale-enter))
				translateY(calc(var(--dry-motion-distance-xs) * -1));
		}
	}

	[data-dp-content] {
		transition:
			opacity var(--dry-duration-fast) var(--dry-ease-emphasized),
			transform var(--dry-duration-fast) var(--dry-ease-emphasized);
	}
</style>
