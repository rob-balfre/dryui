<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getColorPickerCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLInputAttributes, 'value' | 'type' | 'min' | 'max'> {
		channel: 'h' | 's' | 'v';
	}

	let { channel, class: className, ...rest }: Props = $props();

	const ctx = getColorPickerCtx();

	const config = {
		h: { min: 0, max: 360, label: 'Hue' },
		s: { min: 0, max: 100, label: 'Saturation' },
		v: { min: 0, max: 100, label: 'Brightness' }
	} as const;

	const cfg = $derived(config[channel]);
	const value = $derived(ctx.hsv[channel]);

	function onInput(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		const num = Number(target.value);
		if (Number.isNaN(num)) return;
		const clamped = Math.max(cfg.min, Math.min(cfg.max, Math.round(num)));

		if (channel === 'h') {
			ctx.setHue(clamped);
		} else {
			const newS = channel === 's' ? clamped : ctx.hsv.s;
			const newV = channel === 'v' ? clamped : ctx.hsv.v;
			ctx.setSaturationValue(newS, newV);
		}
	}
</script>

<input
	type="number"
	min={cfg.min}
	max={cfg.max}
	step={1}
	{value}
	oninput={onInput}
	disabled={ctx.disabled}
	aria-label={cfg.label}
	data-cp-input
	data-channel={channel}
	data-disabled={ctx.disabled || undefined}
	class={className}
	{...rest}
/>

<style>
	[data-cp-input] {
		padding: var(--dry-space-2) var(--dry-space-3);
		font-size: var(--dry-type-small-size);
		line-height: var(--dry-type-small-leading);
		font-family: var(--dry-font-mono);
		color: var(--dry-color-text-strong);
		background: var(--dry-color-bg-raised);
		border: 1px solid var(--dry-color-stroke-strong);
		border-radius: var(--dry-radius-md);
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default);
		box-sizing: border-box;
		appearance: none;
	}

	[data-cp-input]:hover:not([data-disabled]) {
		border-color: var(--dry-color-stroke-strong);
	}

	[data-cp-input]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: -1px;
		border-color: var(--dry-color-focus-ring);
	}

	[data-cp-input][data-disabled] {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
