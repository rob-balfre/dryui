<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getDateRangePickerCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		startDate: Date;
		endDate: Date;
		children: Snippet;
	}

	let { startDate, endDate, children, class: className, ...rest }: Props = $props();

	const ctx = getDateRangePickerCtx();

	function handleClick() {
		// Directly set the range and close — bypass the two-click flow
		ctx.selectDate(startDate);
		ctx.selectDate(endDate);
	}
</script>

<button type="button" class={className} onclick={handleClick} {...rest}>
	{@render children()}
</button>

<style>
	[data-drp-preset] {
		display: inline-grid;
		place-items: center;
		min-height: var(--dry-space-12);
		padding: var(--dry-space-2) var(--dry-space-3);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-full);
		background: var(--dry-color-bg-raised);
		color: var(--dry-color-text-strong);
		font: inherit;
		font-size: var(--dry-type-small-size);
		cursor: pointer;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-drp-preset]:hover:not([disabled]) {
		border-color: var(--dry-color-stroke-strong);
		background: var(--dry-color-bg-raised);
	}

	[data-drp-preset]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 1px;
	}

	[data-drp-preset][aria-pressed='true'],
	[data-drp-preset][data-selected] {
		background: var(--dry-color-fill-brand);
		color: var(--dry-color-on-brand);
		border-color: transparent;
	}
</style>
