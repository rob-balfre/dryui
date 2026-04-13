<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getOptionPickerCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'value'> {
		value: string;
		disabled?: boolean;
		unavailable?: boolean;
		layout?: 'inline' | 'stacked';
		size?: 'default' | 'compact' | 'visual';
		children: Snippet;
	}

	let {
		value,
		disabled = false,
		unavailable = false,
		layout = 'inline',
		size = 'default',
		children,
		...rest
	}: Props = $props();

	const ctx = getOptionPickerCtx();
	const isDisabled = $derived(disabled || unavailable || ctx.disabled);
	const isSelected = $derived(ctx.isSelected(value));

	function moveFocus(current: HTMLButtonElement, direction: -1 | 1) {
		const group = current.closest('[role="radiogroup"]');
		if (!(group instanceof HTMLElement)) return;

		const items = Array.from(
			group.querySelectorAll<HTMLButtonElement>('[role="radio"]:not([disabled])')
		);
		const index = items.indexOf(current);
		if (index === -1) return;

		const target = items[(index + direction + items.length) % items.length];
		target?.focus();
		const nextValue = target?.dataset.value;
		if (nextValue) ctx.select(nextValue);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (isDisabled || !(event.currentTarget instanceof HTMLButtonElement)) return;

		const isHorizontal = ctx.orientation === 'horizontal';
		if (
			(isHorizontal && event.key === 'ArrowRight') ||
			(!isHorizontal && event.key === 'ArrowDown')
		) {
			event.preventDefault();
			moveFocus(event.currentTarget, 1);
		}
		if ((isHorizontal && event.key === 'ArrowLeft') || (!isHorizontal && event.key === 'ArrowUp')) {
			event.preventDefault();
			moveFocus(event.currentTarget, -1);
		}
		if (event.key === ' ' || event.key === 'Enter') {
			event.preventDefault();
			ctx.select(value);
		}
	}
</script>

<span
	class="root"
	data-layout={layout}
	data-size={size !== 'default' ? size : undefined}
	data-state={isSelected ? 'checked' : 'unchecked'}
	data-selected={isSelected ? '' : undefined}
	data-disabled={isDisabled || undefined}
	data-unavailable={unavailable || undefined}
>
	<Button
		variant="bare"
		type="button"
		role="radio"
		aria-checked={isSelected}
		disabled={isDisabled}
		data-option-picker-item
		data-state={isSelected ? 'checked' : 'unchecked'}
		data-selected={isSelected ? '' : undefined}
		data-unavailable={unavailable || undefined}
		data-value={value}
		tabindex={isSelected ? 0 : -1}
		{...rest}
		onclick={() => {
			if (!isDisabled) ctx.select(value);
		}}
		onkeydown={handleKeydown}
	>
		<span class="content">
			{@render children()}
		</span>
	</Button>
</span>

<style>
	.root {
		--_option-picker-selected-bg: var(
			--dry-option-picker-selected-bg,
			color-mix(in srgb, var(--dry-color-fill-selected) 12%, var(--dry-color-bg-raised) 88%)
		);
		--_option-picker-selected-bg-hover: var(
			--dry-option-picker-selected-bg-hover,
			color-mix(in srgb, var(--dry-color-fill-selected) 16%, var(--dry-color-bg-raised) 84%)
		);
		--_option-picker-selected-border: var(
			--dry-option-picker-selected-border,
			var(--dry-color-stroke-selected)
		);

		display: grid;
		background: var(--dry-option-picker-bg, var(--dry-color-bg-base));
		border: 1px solid var(--dry-option-picker-border, var(--dry-color-stroke-weak));
		border-radius: var(--dry-option-picker-radius, var(--dry-radius-lg));
		box-shadow: var(--dry-option-picker-shadow, none);
		transition:
			background var(--dry-duration-fast, 100ms) ease,
			border-color var(--dry-duration-fast, 100ms) ease,
			box-shadow var(--dry-duration-fast, 100ms) ease,
			transform var(--dry-duration-fast, 100ms) ease;

		--dry-btn-bg: transparent;
		--dry-btn-border: transparent;
		--dry-btn-color: var(--dry-option-picker-color, var(--dry-color-text-strong));
		--dry-btn-padding-x: 0;
		--dry-btn-padding-y: 0;
		--dry-btn-radius: var(--dry-option-picker-radius, var(--dry-radius-lg));
		--dry-btn-justify: stretch;
		--dry-btn-align: stretch;
		--dry-btn-min-height: 0;

		--dry-option-picker-preview-size: 2.25rem;
		--dry-option-picker-preview-radius: var(--dry-radius-md);
		--dry-option-picker-preview-column: 1;
		--dry-option-picker-preview-row: 1 / span 3;
		--dry-option-picker-label-column: 2;
		--dry-option-picker-label-row: 1;
		--dry-option-picker-description-column: 2;
		--dry-option-picker-description-row: 2;
		--dry-option-picker-meta-column: 2;
		--dry-option-picker-meta-row: 3;
	}

	.root:hover:not([data-disabled]) {
		border-color: color-mix(
			in srgb,
			var(--dry-color-stroke-strong) 72%,
			var(--dry-color-stroke-weak) 28%
		);
		background: var(
			--dry-option-picker-bg-hover,
			color-mix(in srgb, var(--dry-color-bg-raised) 92%, var(--dry-color-fill-selected) 8%)
		);
	}

	.root[data-state='checked'] {
		border-color: var(--_option-picker-selected-border);
		background: var(--_option-picker-selected-bg);
	}

	.root[data-state='checked']:hover:not([data-disabled]) {
		background: var(--_option-picker-selected-bg-hover);
	}

	.root:focus-within {
		outline: var(--dry-focus-ring);
		outline-offset: 2px;
	}

	.content {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		justify-items: start;
		gap: var(--dry-option-picker-item-gap, var(--dry-space-3));
		padding: var(--dry-option-picker-padding-y, var(--dry-space-3))
			var(--dry-option-picker-padding-x, var(--dry-space-3));
		min-block-size: var(--dry-option-picker-min-block-size, 3.5rem);
		text-align: left;
	}

	.root[data-layout='stacked'] .content {
		grid-template-columns: 1fr;
		justify-items: center;
		text-align: center;
		--dry-option-picker-preview-size: 3rem;
		--dry-option-picker-preview-column: 1;
		--dry-option-picker-preview-row: 1;
		--dry-option-picker-label-column: 1;
		--dry-option-picker-label-row: 2;
		--dry-option-picker-description-column: 1;
		--dry-option-picker-description-row: 3;
		--dry-option-picker-meta-column: 1;
		--dry-option-picker-meta-row: 4;
	}

	.content:has(> [data-option-picker-label]:only-child) {
		grid-template-columns: 1fr;
		justify-items: center;
		text-align: center;

		--dry-option-picker-label-column: 1;
		--dry-option-picker-label-row: 1;
	}

	.root[data-size='compact'] .content {
		min-block-size: 2.75rem;
	}

	.root[data-size='visual'] .content {
		min-block-size: var(--dry-option-picker-visual-min-block-size, 5.5rem);
	}

	.root[data-disabled] {
		opacity: 0.6;
		border-color: var(--dry-color-stroke-disabled);
		box-shadow: none;
	}
</style>
