<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		value?: number;
		color?: string;
		min?: number;
		max?: number;
		step?: number;
		onchange?: (value: number) => void;
	}

	let {
		value = $bindable(100),
		color = 'hsl(230, 65%, 55%)',
		min = 0,
		max = 100,
		step = 1,
		onchange,
		class: className,
		...rest
	}: Props = $props();

	let swatchColor = $derived(`color-mix(in srgb, ${color} ${value}%, transparent)`);

	function onInput(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		value = Number(target.value);
		onchange?.(value);
	}

	let trackEl = $state<HTMLDivElement>();
	let swatchEl = $state<HTMLDivElement>();

	$effect(() => {
		if (!trackEl) return;
		trackEl.style.setProperty('--_track-bg', `linear-gradient(to right, transparent, ${color})`);
	});

	$effect(() => {
		if (!swatchEl) return;
		swatchEl.style.setProperty('--_swatch-bg', swatchColor);
	});
</script>

<div data-alpha-slider class={className} {...rest}>
	<div data-alpha-slider-track-wrapper>
		<div data-alpha-slider-checkerboard></div>
		<div bind:this={trackEl} data-alpha-slider-color-track></div>
		<input
			type="range"
			data-alpha-slider-input
			{min}
			{max}
			{step}
			{value}
			oninput={onInput}
			aria-label="Opacity"
			aria-valuemin={min}
			aria-valuemax={max}
			aria-valuenow={value}
		/>
	</div>
	<div data-alpha-slider-meta>
		<div data-alpha-slider-swatch-wrapper>
			<div data-alpha-slider-checkerboard></div>
			<div bind:this={swatchEl} data-alpha-slider-swatch></div>
		</div>
		<span data-alpha-slider-value-label>{value}%</span>
	</div>
</div>

<style>
	[data-alpha-slider] {
		display: grid;
		gap: var(--dry-space-2);
	}

	[data-alpha-slider-track-wrapper] {
		position: relative;
		display: grid;
		grid-template-columns: 1fr;
		height: var(--dry-space-4);
		border-radius: var(--dry-radius-full);
		overflow: hidden;
	}

	[data-alpha-slider-checkerboard] {
		position: absolute;
		inset: 0;
		background: repeating-conic-gradient(
				var(--dry-color-bg-overlay) 0% 25%,
				color-mix(in srgb, var(--dry-color-text-strong) 8%, transparent) 0% 50%
			)
			0 0 / var(--dry-space-2) var(--dry-space-2);
	}

	[data-alpha-slider-color-track] {
		position: absolute;
		inset: 0;
		border-radius: var(--dry-radius-full);
		background: var(--_track-bg, linear-gradient(to right, transparent, hsl(230, 65%, 55%)));
	}

	[data-alpha-slider-input] {
		position: relative;
		grid-column: 1;
		grid-row: 1;
		height: 100%;
		appearance: none;
		background: transparent;
		cursor: pointer;
		margin: 0;
	}

	[data-alpha-slider-input]::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		height: var(--dry-space-4);
		aspect-ratio: 1;
		border-radius: 50%;
		background: var(--dry-color-bg-overlay);
		border: 2px solid color-mix(in srgb, var(--dry-color-text-strong) 20%, transparent);
		box-shadow: 0 1px 4px color-mix(in srgb, var(--dry-color-text-strong) 30%, transparent);
		cursor: pointer;
	}

	[data-alpha-slider-input]::-moz-range-thumb {
		height: var(--dry-space-4);
		aspect-ratio: 1;
		border-radius: 50%;
		background: var(--dry-color-bg-overlay);
		border: 2px solid color-mix(in srgb, var(--dry-color-text-strong) 20%, transparent);
		box-shadow: 0 1px 4px color-mix(in srgb, var(--dry-color-text-strong) 30%, transparent);
		cursor: pointer;
	}

	[data-alpha-slider-meta] {
		display: grid;
		grid-template-columns: max-content minmax(var(--dry-space-9), max-content);
		align-items: center;
		gap: var(--dry-space-2);
	}

	[data-alpha-slider-swatch-wrapper] {
		position: relative;
		height: var(--dry-space-6);
		aspect-ratio: 1;
		border-radius: var(--dry-radius-sm);
		overflow: hidden;
		border: 1px solid var(--dry-color-stroke-weak);
	}

	[data-alpha-slider-swatch] {
		position: absolute;
		inset: 0;
		background: var(--_swatch-bg, hsl(230, 65%, 55%));
	}

	[data-alpha-slider-value-label] {
		font-size: var(--dry-type-small-size);
		font-variant-numeric: tabular-nums;
		color: var(--dry-color-text-weak);
	}
</style>
