<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getToggleGroupCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		value: string;
		disabled?: boolean;
		children: Snippet;
	}

	let { value, disabled = false, class: className, children, ...rest }: Props = $props();

	const ctx = getToggleGroupCtx();

	let isDisabled = $derived(disabled || ctx.disabled);
	let isSelected = $derived(ctx.isSelected(value));
</script>

<button
	type="button"
	aria-pressed={isSelected}
	disabled={isDisabled}
	data-part="item"
	data-state={isSelected ? 'on' : 'off'}
	data-orientation={ctx.orientation}
	data-disabled={isDisabled || undefined}
	class={className}
	onclick={() => {
		if (!isDisabled) {
			ctx.toggle(value);
		}
	}}
	{...rest}
>
	{@render children()}
</button>

<style>
	[data-part='item'] {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		place-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-tg-padding-y, var(--dry-space-2)) var(--dry-tg-padding-x, var(--dry-space-3));
		font-size: var(--dry-tg-font-size, var(--dry-type-small-size, var(--dry-text-sm-size)));
		font-family: var(--dry-font-sans);
		font-weight: 500;
		line-height: 1.25;
		color: var(--dry-color-text-strong);
		background: transparent;
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: 0;
		cursor: pointer;
		user-select: none;
		position: relative;
		min-height: var(--dry-tg-min-height, var(--dry-space-10));
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default),
			border-color var(--dry-duration-fast) var(--dry-ease-default);

		&:hover:not([data-disabled]):not([data-state='on']) {
			background: var(--dry-color-fill-hover);
		}

		&:active:not([data-disabled]):not([data-state='on']) {
			background: var(--dry-color-fill-active);
		}

		&[data-state='on'] {
			background: var(--dry-tg-item-selected-bg, var(--dry-color-fill-selected));
			color: var(--dry-tg-item-selected-color, var(--dry-color-on-brand));
			border-color: var(--dry-tg-item-selected-border, var(--dry-color-stroke-selected));
			box-shadow: inset 0 0 0 1px
				var(--dry-tg-item-selected-border, var(--dry-color-stroke-selected));
			font-weight: 600;
			z-index: 1;
		}

		&[data-state='on']:hover:not([data-disabled]) {
			background: var(--dry-tg-item-selected-bg, var(--dry-color-fill-selected));
		}

		&[data-state='on']:active:not([data-disabled]) {
			background: var(--dry-tg-item-selected-bg, var(--dry-color-fill-selected));
		}

		&:focus-visible {
			outline: 2px solid var(--dry-color-stroke-focus);
			outline-offset: -2px;
			z-index: 2;
		}

		&[data-disabled] {
			background: var(--dry-color-fill-disabled);
			border-color: var(--dry-color-stroke-disabled);
			color: var(--dry-color-text-disabled);
			opacity: 1;
			cursor: not-allowed;
			pointer-events: none;
		}
	}

	[data-orientation='horizontal']:first-child {
		border-top-left-radius: var(--dry-tg-radius, var(--dry-radius-md));
		border-bottom-left-radius: var(--dry-tg-radius, var(--dry-radius-md));
	}

	[data-orientation='horizontal']:last-child {
		border-top-right-radius: var(--dry-tg-radius, var(--dry-radius-md));
		border-bottom-right-radius: var(--dry-tg-radius, var(--dry-radius-md));
	}

	[data-orientation='horizontal']:not(:first-child) {
		border-inline-start: 0;
	}

	[data-orientation='vertical']:first-child {
		border-top-left-radius: var(--dry-tg-radius, var(--dry-radius-md));
		border-top-right-radius: var(--dry-tg-radius, var(--dry-radius-md));
	}

	[data-orientation='vertical']:last-child {
		border-bottom-left-radius: var(--dry-tg-radius, var(--dry-radius-md));
		border-bottom-right-radius: var(--dry-tg-radius, var(--dry-radius-md));
	}

	[data-orientation='vertical']:not(:first-child) {
		border-block-start: 0;
	}
</style>
