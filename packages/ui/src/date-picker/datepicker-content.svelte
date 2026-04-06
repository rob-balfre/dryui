<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDatePickerCtx } from './context.svelte.js';
	import { useAnchorStyles } from '../utils/use-anchor-styles.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placement?:
			| 'top'
			| 'top-start'
			| 'top-end'
			| 'bottom'
			| 'bottom-start'
			| 'bottom-end'
			| 'left'
			| 'left-start'
			| 'left-end'
			| 'right'
			| 'right-start'
			| 'right-end';
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

	let el = $state<HTMLDivElement>();

	const anchor = useAnchorStyles({
		triggerEl: () => ctx.triggerEl,
		contentEl: () => el ?? null,
		placement: () => placement,
		offset: () => offset
	});

	$effect(() => {
		if (ctx.open && el && !el.matches(':popover-open')) {
			el.showPopover();
		} else if (!ctx.open && el?.matches(':popover-open')) {
			el.hidePopover();
		}
	});
</script>

<div
	bind:this={el}
	popover="auto"
	role="dialog"
	id={ctx.contentId}
	aria-labelledby={ctx.triggerId}
	data-state={ctx.open ? 'open' : 'closed'}
	data-dp-content
	class={className}
	use:anchor.applyPosition={style}
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
