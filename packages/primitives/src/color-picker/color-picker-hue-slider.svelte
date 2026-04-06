<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getColorPickerCtx } from './context.svelte.js';

	type Props = Omit<HTMLInputAttributes, 'value' | 'type' | 'min' | 'max' | 'step'>;

	let { class: className, style, ...rest }: Props = $props();

	const ctx = getColorPickerCtx();

	let hue = $derived(ctx.hsv.h);

	function onInput(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		ctx.setHue(Number(target.value));
	}

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
		});
	}
</script>

<input
	type="range"
	min="0"
	max="360"
	step="1"
	value={hue}
	oninput={onInput}
	disabled={ctx.disabled}
	aria-label="Hue"
	aria-valuemin={0}
	aria-valuemax={360}
	aria-valuenow={hue}
	data-disabled={ctx.disabled || undefined}
	class={['hueSlider', className]}
	{...rest}
	use:applyStyles
/>

<style>
	.hueSlider {
		background: linear-gradient(
			to right,
			hsl(0 100% 50%),
			hsl(60 100% 50%),
			hsl(120 100% 50%),
			hsl(180 100% 50%),
			hsl(240 100% 50%),
			hsl(300 100% 50%),
			hsl(360 100% 50%)
		);
	}
</style>
