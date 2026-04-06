<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getSegmentedControlCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		value: string;
		disabled?: boolean;
		children: Snippet;
	}

	let { value, disabled = false, class: className, children, onclick, ...rest }: Props = $props();

	const ctx = getSegmentedControlCtx();
	const isSelected = $derived(ctx.value === value);
	const isDisabled = $derived(disabled || ctx.disabled);

	function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }) {
		if (isDisabled) return;
		ctx.select(value);
		onclick?.(event);
	}
</script>

<button
	type="button"
	aria-pressed={isSelected}
	data-part="item"
	data-segmented-control-item
	data-state={isSelected ? 'on' : 'off'}
	data-orientation={ctx.orientation}
	data-disabled={isDisabled || undefined}
	disabled={isDisabled}
	class={className}
	onclick={handleClick}
	{...rest}
>
	{@render children()}
</button>

<style>
	[data-part='item'] {
		appearance: none;
		border: 1px solid var(--dry-sc-border, var(--dry-color-stroke-weak));
		background: var(--dry-sc-bg, var(--dry-color-fill));
		color: var(--dry-sc-foreground, var(--dry-color-text-strong));
		display: inline-grid;
		place-items: center;
		gap: var(--dry-space-2);
		min-height: var(--dry-space-10);
		padding: var(--dry-space-2) var(--dry-space-4);
		font-family: var(--dry-font-sans);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		font-weight: 500;
		line-height: 1.25;
		cursor: pointer;
		user-select: none;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default),
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default);

		&:hover:not(:disabled):not([data-state='on']) {
			background: var(--dry-color-fill-hover);
		}

		&:active:not(:disabled) {
			transform: translateY(1px);
		}

		&:focus-visible {
			outline: 2px solid var(--dry-color-stroke-focus);
			outline-offset: -2px;
			position: relative;
			z-index: 1;
		}

		&[data-state='on'] {
			background: var(--dry-sc-selected-bg);
			color: var(--dry-sc-selected-color, var(--dry-color-text-strong));
			border-color: var(--dry-sc-selected-border);
			box-shadow:
				inset 0 0 0 1px var(--dry-sc-selected-border),
				var(--dry-shadow-sm);
			font-weight: 600;
			position: relative;
			z-index: 1;
		}

		&[data-state='on']:hover:not(:disabled) {
			background: var(--dry-sc-selected-bg);
			border-color: var(--dry-sc-selected-border);
		}

		&:disabled,
		&[data-disabled] {
			background: var(--dry-color-fill-disabled);
			border-color: var(--dry-color-stroke-disabled);
			color: var(--dry-color-text-disabled);
			cursor: not-allowed;
			opacity: 1;
		}
	}

	[data-orientation='horizontal'] {
		border-radius: 0;

		&:first-child {
			border-top-left-radius: var(--dry-sc-radius, var(--dry-radius-lg));
			border-bottom-left-radius: var(--dry-sc-radius, var(--dry-radius-lg));
		}

		&:last-child {
			border-top-right-radius: var(--dry-sc-radius, var(--dry-radius-lg));
			border-bottom-right-radius: var(--dry-sc-radius, var(--dry-radius-lg));
		}

		&:not(:first-child) {
			margin-inline-start: -1px;
		}
	}

	[data-orientation='vertical'] {
		border-radius: 0;

		&:first-child {
			border-top-left-radius: var(--dry-sc-radius, var(--dry-radius-lg));
			border-top-right-radius: var(--dry-sc-radius, var(--dry-radius-lg));
		}

		&:last-child {
			border-bottom-left-radius: var(--dry-sc-radius, var(--dry-radius-lg));
			border-bottom-right-radius: var(--dry-sc-radius, var(--dry-radius-lg));
		}

		&:not(:first-child) {
			margin-block-start: -1px;
		}
	}
</style>
