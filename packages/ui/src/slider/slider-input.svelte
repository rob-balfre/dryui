<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getFormControlCtx } from '@dryui/primitives';

	interface Props extends Omit<HTMLInputAttributes, 'size'> {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		size?: 'sm' | 'md' | 'lg';
		variant?: 'default' | 'pill';
		disabled?: boolean;
		orientation?: 'horizontal' | 'vertical';
		valueLabel?: Snippet<[{ value: number; percentage: number }]>;
	}

	let {
		value = $bindable(50),
		min = 0,
		max = 100,
		step = 1,
		size = 'md',
		variant = 'default',
		disabled = false,
		orientation = 'horizontal',
		valueLabel,
		class: className,
		...rest
	}: Props = $props();

	const ctx = getFormControlCtx();
	const isDisabled = $derived(disabled || ctx?.disabled || false);

	let progress = $derived(((value - min) / (max - min)) * 100);
	let isPill = $derived(variant === 'pill');

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('--dry-slider-progress', `${progress}%`);
		});
	}
</script>

<span class="wrapper" data-variant={variant} data-size={size} use:applyStyles>
	<input
		type="range"
		bind:value
		id={ctx?.id}
		{min}
		{max}
		{step}
		disabled={isDisabled}
		required={ctx?.required || undefined}
		aria-describedby={ctx?.describedBy}
		aria-invalid={ctx?.hasError || undefined}
		aria-errormessage={ctx?.errorMessageId}
		data-disabled={isDisabled || undefined}
		data-orientation={orientation}
		data-variant={variant}
		data-size={size}
		class={className}
		{...rest}
	/>
	{#if isPill}
		<span data-part="value-label" aria-hidden="true">
			{#if valueLabel}
				{@render valueLabel({ value, percentage: progress })}
			{:else}
				{Math.round(progress)}%
			{/if}
		</span>
	{/if}
</span>

<style>
	.wrapper {
		display: grid;
	}

	input {
		--dry-slider-track-height: 8px;
		--dry-slider-thumb-size: 24px;
		appearance: none;
		-webkit-appearance: none;
		background: transparent;
		cursor: pointer;
		margin: 0;

		/* Track - WebKit */
		&::-webkit-slider-runnable-track {
			height: var(--dry-slider-track-height);
			border-radius: var(--dry-radius-full);
			border: 1px solid var(--dry-color-stroke-weak);
			box-shadow: var(--dry-shadow-sunken);
			background-color: var(--dry-color-fill);
			background-image: linear-gradient(
				var(--dry-color-fill-selected),
				var(--dry-color-fill-selected)
			);
			background-size: var(--dry-slider-progress, 50%) 100%;
			background-repeat: no-repeat;
		}

		/* Track - Firefox */
		&::-moz-range-track {
			height: var(--dry-slider-track-height);
			border-radius: var(--dry-radius-full);
			border: 1px solid var(--dry-color-stroke-weak);
			box-shadow: var(--dry-shadow-sunken);
			background: var(--dry-color-fill);
		}

		&::-moz-range-progress {
			height: var(--dry-slider-track-height);
			border-radius: var(--dry-radius-full);
			background: var(--dry-color-fill-selected);
		}

		/* Thumb - WebKit */
		&::-webkit-slider-thumb {
			-webkit-appearance: none;
			appearance: none;
			aspect-ratio: 1;
			height: var(--dry-slider-thumb-size);
			border-radius: var(--dry-radius-full);
			background: var(--dry-color-bg-overlay);
			border: 2px solid var(--dry-color-fill-brand);
			box-shadow: var(--dry-shadow-sm);
			margin-top: calc((var(--dry-slider-track-height) - var(--dry-slider-thumb-size)) / 2);
			transition:
				transform var(--dry-duration-fast) var(--dry-ease-default),
				box-shadow var(--dry-duration-fast) var(--dry-ease-default);
		}

		/* Thumb - Firefox */
		&::-moz-range-thumb {
			aspect-ratio: 1;
			height: var(--dry-slider-thumb-size);
			border-radius: var(--dry-radius-full);
			background: var(--dry-color-bg-overlay);
			border: 2px solid var(--dry-color-fill-brand);
			box-shadow: var(--dry-shadow-sm);
			transition:
				transform var(--dry-duration-fast) var(--dry-ease-default),
				box-shadow var(--dry-duration-fast) var(--dry-ease-default);
		}

		&:hover:not([data-disabled])::-webkit-slider-thumb {
			transform: scale(1.1);
		}

		&:hover:not([data-disabled])::-moz-range-thumb {
			transform: scale(1.1);
		}

		&:active:not([data-disabled])::-webkit-slider-thumb {
			transform: scale(0.95);
		}

		&:active:not([data-disabled])::-moz-range-thumb {
			transform: scale(0.95);
		}

		&:active:not([data-disabled]) {
			cursor: grabbing;
		}

		&:focus-visible {
			outline: var(--dry-focus-ring);
			outline-offset: 4px;
		}

		&[data-disabled] {
			opacity: var(--dry-state-disabled-opacity);
			cursor: not-allowed;
		}

		&[data-orientation='vertical'] {
			writing-mode: vertical-lr;
			direction: rtl;
		}
	}

	input[data-size='sm'] {
		--dry-slider-track-height: 4px;
		--dry-slider-thumb-size: 20px;
	}

	input[data-size='md'] {
		--dry-slider-track-height: 8px;
		--dry-slider-thumb-size: 24px;
	}

	input[data-size='lg'] {
		--dry-slider-track-height: 8px;
		--dry-slider-thumb-size: 28px;
	}

	/* ── Pill variant ── */

	.wrapper[data-variant='pill'] input,
	.wrapper[data-variant='pill'] [data-part='value-label'] {
		grid-area: 1 / 1;
	}

	input[data-variant='pill'][data-size='sm'] {
		--dry-slider-track-height: 32px;
		--dry-slider-thumb-size: 32px;
	}

	input[data-variant='pill'][data-size='md'] {
		--dry-slider-track-height: 40px;
		--dry-slider-thumb-size: 40px;
	}

	input[data-variant='pill'][data-size='lg'] {
		--dry-slider-track-height: 48px;
		--dry-slider-thumb-size: 48px;
	}

	input[data-variant='pill']::-webkit-slider-thumb {
		background: transparent;
		border: none;
		box-shadow: none;
		margin-top: 0;
	}

	input[data-variant='pill']::-moz-range-thumb {
		background: transparent;
		border: none;
		box-shadow: none;
	}

	input[data-variant='pill']:hover:not([data-disabled])::-webkit-slider-thumb,
	input[data-variant='pill']:active:not([data-disabled])::-webkit-slider-thumb {
		transform: none;
	}

	input[data-variant='pill']:hover:not([data-disabled])::-moz-range-thumb,
	input[data-variant='pill']:active:not([data-disabled])::-moz-range-thumb {
		transform: none;
	}

	/* Pill value label */
	.wrapper[data-variant='pill'] [data-part='value-label'] {
		pointer-events: none;
		display: grid;
		align-items: center;
		padding-inline: var(--dry-space-4);
		font-size: var(--dry-text-sm-size, 0.875rem);
		font-weight: 600;
		color: var(--dry-color-text);
		clip-path: inset(
			0 calc(100% - var(--dry-slider-progress, 50%)) 0 0 round var(--dry-radius-full)
		);
		transition: clip-path var(--dry-duration-fast) var(--dry-ease-default);
		z-index: 1;
	}

	.wrapper[data-variant='pill'][data-size='sm'] [data-part='value-label'] {
		font-size: var(--dry-text-xs-size, 0.75rem);
		padding-inline: var(--dry-space-3);
	}

	.wrapper[data-variant='pill'][data-size='lg'] [data-part='value-label'] {
		font-size: var(--dry-text-base-size, 1rem);
		padding-inline: var(--dry-space-5);
	}

	@media (prefers-reduced-motion: reduce) {
		.wrapper[data-variant='pill'] [data-part='value-label'] {
			transition: none;
		}
	}
</style>
