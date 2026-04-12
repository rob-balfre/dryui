<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getFormControlCtx } from '@dryui/primitives';

	interface Props extends Omit<HTMLInputAttributes, 'size'> {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		orientation?: 'horizontal' | 'vertical';
	}

	let {
		value = $bindable(50),
		min = 0,
		max = 100,
		step = 1,
		size = 'md',
		disabled = false,
		orientation = 'horizontal',
		class: className,
		...rest
	}: Props = $props();

	const ctx = getFormControlCtx();
	const isDisabled = $derived(disabled || ctx?.disabled || false);

	let progress = $derived(((value - min) / (max - min)) * 100);

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('--dry-slider-progress', `${progress}%`);
		});
	}
</script>

<span class="wrapper">
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
		data-size={size}
		class={className}
		use:applyStyles
		{...rest}
	/>
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
			outline: 2px solid var(--dry-color-focus-ring);
			outline-offset: 4px;
		}

		&[data-disabled] {
			opacity: 0.5;
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
</style>
