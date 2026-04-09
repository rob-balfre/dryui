<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

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

	function decrement() {
		const next = value - step;
		if (min !== undefined && next < min) return;
		value = next;
	}

	function increment() {
		const next = value + step;
		if (max !== undefined && next > max) return;
		value = next;
	}
</script>

<span data-number-input-wrapper data-size={size} data-disabled={disabled || undefined}>
	<div role="group" data-disabled={disabled || undefined}>
		<button type="button" tabindex="-1" aria-label="Decrease value" {disabled} onclick={decrement}
			>&minus;</button
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
		<button type="button" tabindex="-1" aria-label="Increase value" {disabled} onclick={increment}
			>+</button
		>
	</div>
</span>

<style>
	[data-number-input-wrapper] {
		container-type: inline-size;
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: stretch;
		--dry-number-input-max-width: 12rem;
		--dry-number-input-btn-width: 2em;

		--dry-input-bg: var(--dry-color-bg-raised);
		--dry-input-border: var(--dry-color-stroke-strong);
		--dry-input-color: var(--dry-color-text-strong);
		--dry-input-radius: var(--dry-radius-md);
		--dry-input-padding-x: var(--dry-space-3);
		--dry-input-padding-y: var(--dry-space-2);
		--dry-input-font-size: var(--dry-type-small-size);
		--dry-number-input-focus-z-index: 1;
	}

	[data-number-input-wrapper] div {
		display: inline-grid;
		grid-template-columns: var(--dry-number-input-btn-width) minmax(3ch, max-content) var(
				--dry-number-input-btn-width
			);
		align-items: stretch;
	}

	[data-number-input-wrapper] button {
		display: inline-grid;
		place-items: center;
		padding: 0;
		font-size: var(--dry-input-font-size);
		font-family: var(--dry-font-sans);
		color: var(--dry-input-color);
		background: var(--dry-input-bg);
		border: 1px solid var(--dry-input-border);
		cursor: pointer;
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			background var(--dry-duration-fast) var(--dry-ease-default);
		box-sizing: border-box;
		line-height: 1;
		user-select: none;
	}

	[data-number-input-wrapper] button:hover:not(:disabled) {
		border-color: var(--dry-color-stroke-strong);
		background: var(--dry-color-bg-raised);
	}

	[data-number-input-wrapper] button:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: -1px;
		border-color: var(--dry-color-focus-ring);
		z-index: var(--dry-number-input-focus-z-index);
	}

	[data-number-input-wrapper] button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	[data-number-input-wrapper] button:first-child {
		border-radius: var(--dry-input-radius) 0 0 var(--dry-input-radius);
		border-right: none;
	}

	[data-number-input-wrapper] button:last-child {
		border-radius: 0 var(--dry-input-radius) var(--dry-input-radius) 0;
		border-left: none;
	}

	[data-number-input-wrapper] input {
		padding: var(--dry-input-padding-y) var(--dry-input-padding-x);
		font-size: var(--dry-input-font-size);
		line-height: var(--dry-type-small-leading);
		font-family: var(--dry-font-sans);
		color: var(--dry-input-color);
		background: var(--dry-input-bg);
		border: 1px solid var(--dry-input-border);
		border-radius: 0;
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default);
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
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: -1px;
		border-color: var(--dry-color-focus-ring);
		z-index: var(--dry-number-input-focus-z-index);
	}

	[data-number-input-wrapper] input[data-disabled] {
		opacity: 0.5;
		cursor: not-allowed;
	}

	[data-number-input-wrapper][data-disabled] {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Size variants */
	[data-number-input-wrapper][data-size='sm'] {
		--dry-input-padding-x: var(--dry-space-2);
		--dry-input-padding-y: var(--dry-space-1);
		--dry-input-font-size: var(--dry-type-tiny-size);
		--dry-number-input-max-width: 8rem;
		--dry-number-input-btn-width: 1.75em;
	}

	[data-number-input-wrapper][data-size='sm'] input {
		line-height: var(--dry-type-tiny-leading);
	}

	[data-number-input-wrapper][data-size='md'] {
		--dry-input-padding-x: var(--dry-space-3);
		--dry-input-padding-y: var(--dry-space-2);
		--dry-input-font-size: var(--dry-type-small-size);
		--dry-number-input-max-width: 10rem;
		--dry-number-input-btn-width: 2em;
	}

	[data-number-input-wrapper][data-size='md'] input {
		line-height: var(--dry-type-small-leading);
	}

	[data-number-input-wrapper][data-size='lg'] {
		--dry-input-padding-x: var(--dry-space-4);
		--dry-input-padding-y: var(--dry-space-2_5);
		--dry-input-font-size: var(--dry-type-heading-4-size);
		--dry-number-input-max-width: 12rem;
		--dry-number-input-btn-width: 2.5em;
	}

	[data-number-input-wrapper][data-size='lg'] input {
		line-height: var(--dry-type-heading-4-leading);
	}

	/* Container query */
	@container (max-width: 200px) {
		[data-number-input-wrapper] {
			--dry-input-padding-x: var(--dry-space-2);
		}
	}
</style>
