<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createAnchoredPopover, type Placement } from '@dryui/primitives';
	import type { PickerPopoverController } from './date-family-controller.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		controller: PickerPopoverController;
		dataAttribute: 'data-dp-content' | 'data-drp-content';
		placement?: Placement;
		offset?: number;
		contentClass?: HTMLAttributes<HTMLDivElement>['class'];
		contentStyle?: HTMLAttributes<HTMLDivElement>['style'];
		children: Snippet;
	}

	let {
		controller,
		dataAttribute,
		placement = 'bottom-start',
		offset = 8,
		contentClass,
		contentStyle,
		children,
		...rest
	}: Props = $props();

	let el = $state<HTMLDivElement>();

	const markerAttrs = $derived.by<Record<string, string>>(() => ({
		'data-picker-popover-content': '',
		[dataAttribute]: ''
	}));

	const popover = createAnchoredPopover({
		triggerEl: () => controller.triggerEl,
		contentEl: () => el ?? null,
		open: () => controller.open,
		placement: () => placement,
		offset: () => offset
	});
</script>

<div
	bind:this={el}
	use:popover.applyPosition={contentStyle}
	popover="auto"
	role="dialog"
	id={controller.contentId}
	aria-labelledby={controller.triggerId}
	data-state={controller.open ? 'open' : 'closed'}
	class={contentClass}
	{...markerAttrs}
	ontoggle={(e) => {
		const newState = (e as ToggleEvent).newState === 'open';

		if (newState && !controller.open) {
			controller.show();
		} else if (!newState && controller.open) {
			controller.close();
		}
	}}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-picker-popover-content] {
		inset: unset;
		margin: 0;
		display: inline-grid;
		padding: var(--dry-space-3);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		background: var(--dry-color-bg-overlay);
		box-shadow: var(--dry-shadow-lg);
		color: var(--dry-color-text-strong);
		transition:
			opacity var(--dry-duration-fast) var(--dry-ease-emphasized),
			transform var(--dry-duration-fast) var(--dry-ease-emphasized);
	}

	[data-picker-popover-content]:not(:popover-open) {
		display: none;
	}

	[data-picker-popover-content]:popover-open {
		display: inline-grid;
		opacity: 1;
		transform: translateY(0) scale(1);
	}

	@starting-style {
		[data-picker-popover-content]:popover-open {
			opacity: 0;
			transform: translateY(calc(var(--dry-motion-distance-xs) * -1))
				scale(var(--dry-motion-scale-enter));
		}
	}
</style>
