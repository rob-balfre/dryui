<script lang="ts">
	import { fromAction } from 'svelte/attachments';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createAnchoredPopover, type Placement } from '@dryui/primitives';
	import { getDateRangePickerCtx } from './context.svelte.js';

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

	const ctx = getDateRangePickerCtx();

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
	data-drp-content
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
	[data-drp-content] {
		inset: unset;
		margin: 0;
		padding: var(--dry-space-3);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		background: var(--dry-color-bg-overlay);
		box-shadow: var(--dry-shadow-lg);
		color: var(--dry-color-text-strong);
	}

	[data-drp-content]:popover-open {
		opacity: 1;
		transform: translateY(0) scale(1);
	}

	@starting-style {
		[data-drp-content]:popover-open {
			opacity: 0;
			transform: translateY(calc(var(--dry-motion-distance-xs) * -1))
				scale(var(--dry-motion-scale-enter));
		}
	}

	[data-drp-content] {
		transition:
			opacity var(--dry-duration-fast) var(--dry-ease-emphasized),
			transform var(--dry-duration-fast) var(--dry-ease-emphasized);
	}
</style>
