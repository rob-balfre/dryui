<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getColorPickerCtx } from './context.svelte.js';

	type Props = Omit<HTMLInputAttributes, 'value' | 'type' | 'min' | 'max' | 'step'>;

	let { class: className, style, ...rest }: Props = $props();

	const ctx = getColorPickerCtx();

	const alphaPercent = $derived(Math.round(ctx.alpha * 100));

	function onInput(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		ctx.setAlpha(Number(target.value) / 100);
	}

	const rgbStr = $derived(`${ctx.rgb.r}, ${ctx.rgb.g}, ${ctx.rgb.b}`);

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
			node.style.setProperty('--dry-alpha-rgb', rgbStr);
		});
	}
</script>

<div data-cp-slider-wrapper>
	<input
		type="range"
		min="0"
		max="100"
		step="1"
		value={alphaPercent}
		oninput={onInput}
		disabled={ctx.disabled}
		aria-label="Opacity"
		aria-valuemin={0}
		aria-valuemax={100}
		aria-valuenow={alphaPercent}
		data-cp-slider
		data-disabled={ctx.disabled || undefined}
		class={className}
		{...rest}
		use:applyStyles
	/>
</div>

<style>
	[data-cp-slider-wrapper] {
		display: grid;
		align-items: center;
	}

	[data-cp-slider] {
		--dry-slider-track-height: var(--dry-color-picker-slider-track-height);
		--dry-slider-thumb-size: var(--dry-color-picker-slider-thumb-size);

		appearance: none;
		-webkit-appearance: none;
		cursor: pointer;
		margin: 0;
		border-radius: var(--dry-radius-full);
		height: var(--dry-slider-track-height);
		padding: 0;
		border: none;
		outline: none;
		background:
			linear-gradient(to right, rgba(var(--dry-alpha-rgb), 0), rgba(var(--dry-alpha-rgb), 1)),
			repeating-conic-gradient(
					color-mix(in srgb, var(--dry-color-text-strong) 12%, transparent) 0% 25%,
					var(--dry-color-bg-overlay) 0% 50%
				)
				0 0 / 12px 12px;
	}

	[data-cp-slider]::-webkit-slider-runnable-track {
		height: var(--dry-slider-track-height);
		border-radius: var(--dry-radius-full);
	}

	[data-cp-slider]::-moz-range-track {
		height: var(--dry-slider-track-height);
		border-radius: var(--dry-radius-full);
	}

	[data-cp-slider]::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		height: var(--dry-slider-thumb-size);
		aspect-ratio: 1;
		border-radius: 50%;
		background: var(--dry-color-picker-slider-thumb-bg);
		border: 2px solid var(--dry-color-picker-slider-thumb-border);
		box-shadow: var(--dry-color-picker-slider-thumb-shadow);
		margin-top: calc((var(--dry-slider-track-height) - var(--dry-slider-thumb-size)) / 2);
		transition:
			transform var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default);
		cursor: pointer;
	}

	[data-cp-slider]::-moz-range-thumb {
		height: var(--dry-slider-thumb-size);
		aspect-ratio: 1;
		border-radius: 50%;
		background: var(--dry-color-picker-slider-thumb-bg);
		border: 2px solid var(--dry-color-picker-slider-thumb-border);
		box-shadow: var(--dry-color-picker-slider-thumb-shadow);
		transition:
			transform var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default);
		cursor: pointer;
	}

	[data-cp-slider]:hover:not([data-disabled])::-webkit-slider-thumb {
		transform: scale(1.1);
		box-shadow: var(--dry-color-picker-slider-thumb-shadow-hover);
	}

	[data-cp-slider]:hover:not([data-disabled])::-moz-range-thumb {
		transform: scale(1.1);
		box-shadow: var(--dry-color-picker-slider-thumb-shadow-hover);
	}

	[data-cp-slider]:active:not([data-disabled])::-webkit-slider-thumb {
		transform: scale(0.95);
	}

	[data-cp-slider]:active:not([data-disabled])::-moz-range-thumb {
		transform: scale(0.95);
	}

	[data-cp-slider]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}

	[data-cp-slider][data-disabled] {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
