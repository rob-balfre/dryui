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

	// Transparent to current color gradient
	const rgbStr = $derived(`${ctx.rgb.r}, ${ctx.rgb.g}, ${ctx.rgb.b}`);

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
			node.style.setProperty('--dry-alpha-rgb', rgbStr);
		});
	}
</script>

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
	data-disabled={ctx.disabled || undefined}
	class={['alphaSlider', className]}
	{...rest}
	use:applyStyles
/>

<style>
	.alphaSlider {
		background:
			linear-gradient(to right, rgba(var(--dry-alpha-rgb), 0), rgba(var(--dry-alpha-rgb), 1)),
			repeating-conic-gradient(
					color-mix(in srgb, var(--dry-color-text-strong) 12%, transparent) 0% 25%,
					var(--dry-color-bg-overlay) 0% 50%
				)
				0 0 / 12px 12px;
	}
</style>
