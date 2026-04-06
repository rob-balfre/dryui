<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDateRangePickerCtx } from './context.svelte.js';
	import { useAnchorStyles } from '../utils/use-anchor-styles.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end';
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
	data-drp-content
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
