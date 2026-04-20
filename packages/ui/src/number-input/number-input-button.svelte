<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';

	interface Props extends Omit<HTMLInputAttributes, 'size'> {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
	}

	let {
		value = $bindable(0),
		min,
		max,
		step = 1,
		size = 'md',
		disabled = false,
		class: className,
		...rest
	}: Props = $props();

	function nudge(direction: 1 | -1) {
		const next = value + direction * step;
		if (min !== undefined && next < min) return;
		if (max !== undefined && next > max) return;
		value = next;
	}
</script>

<div role="group" data-number-input-wrapper data-size={size} data-disabled={disabled || undefined}>
	<Button
		variant="outline"
		size={size === 'sm' ? 'icon-sm' : size === 'lg' ? 'icon-lg' : 'icon'}
		type="button"
		tabindex={-1}
		aria-label="Decrease value"
		{disabled}
		onclick={() => nudge(-1)}>&minus;</Button
	>
	<input
		type="number"
		bind:value
		class={className ?? ''}
		{min}
		{max}
		{step}
		{disabled}
		data-disabled={disabled || undefined}
		{...rest}
	/>
	<Button
		variant="outline"
		size={size === 'sm' ? 'icon-sm' : size === 'lg' ? 'icon-lg' : 'icon'}
		type="button"
		tabindex={-1}
		aria-label="Increase value"
		{disabled}
		onclick={() => nudge(1)}>+</Button
	>
</div>

<style>
	[data-number-input-wrapper] {
		display: inline-grid;
		grid-template-columns: auto minmax(3ch, max-content) auto;
		align-items: stretch;
		gap: var(--dry-space-1);
		--dry-input-bg: var(--dry-color-bg-raised);
		--dry-input-border: var(--dry-color-stroke-strong);
		--dry-input-color: var(--dry-color-text-strong);
		--dry-input-radius: var(--dry-radius-md);
		--dry-input-padding-x: var(--dry-space-3);
		--dry-input-padding-y: var(--dry-space-2);
		--dry-input-font-size: var(--dry-type-small-size);
	}

	[data-number-input-wrapper] input {
		padding: var(--dry-input-padding-y) var(--dry-input-padding-x);
		font-size: var(--dry-input-font-size);
		line-height: var(--dry-type-small-leading);
		font-family: var(--dry-font-sans);
		font-variant-numeric: tabular-nums;
		color: var(--dry-input-color);
		background: var(--dry-input-bg);
		border: 1px solid var(--dry-input-border);
		border-radius: var(--dry-input-radius);
		transition: border-color var(--dry-duration-fast) var(--dry-ease-default);
		box-sizing: border-box;
		appearance: none;
		text-align: center;
		-moz-appearance: textfield;
	}

	[data-number-input-wrapper] input::-webkit-outer-spin-button,
	[data-number-input-wrapper] input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	[data-number-input-wrapper] input::placeholder {
		color: var(--dry-color-text-weak);
	}

	[data-number-input-wrapper] input:hover:not([data-disabled]) {
		border-color: var(--dry-color-stroke-strong);
	}

	[data-number-input-wrapper] input:focus-visible {
		outline: var(--dry-focus-ring);
		outline-offset: -1px;
		border-color: var(--dry-color-focus-ring);
	}

	[data-number-input-wrapper] input[data-disabled] {
		opacity: var(--dry-state-disabled-opacity);
		cursor: not-allowed;
	}

	[data-number-input-wrapper][data-disabled] {
		opacity: var(--dry-state-disabled-opacity);
		cursor: not-allowed;
	}

	[data-number-input-wrapper][data-size='sm'] {
		--dry-input-padding-x: var(--dry-space-2);
		--dry-input-padding-y: var(--dry-space-1);
		--dry-input-font-size: var(--dry-type-tiny-size);
	}

	[data-number-input-wrapper][data-size='sm'] input {
		line-height: var(--dry-type-tiny-leading);
	}

	[data-number-input-wrapper][data-size='md'] {
		--dry-input-padding-x: var(--dry-space-3);
		--dry-input-padding-y: var(--dry-space-2);
		--dry-input-font-size: var(--dry-type-small-size);
	}

	[data-number-input-wrapper][data-size='md'] input {
		line-height: var(--dry-type-small-leading);
	}

	[data-number-input-wrapper][data-size='lg'] {
		--dry-input-padding-x: var(--dry-space-4);
		--dry-input-padding-y: var(--dry-space-2_5);
		--dry-input-font-size: var(--dry-type-heading-4-size);
	}

	[data-number-input-wrapper][data-size='lg'] input {
		line-height: var(--dry-type-heading-4-leading);
	}
</style>
