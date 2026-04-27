<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setColorPickerCtx } from './context.svelte.js';
	import {
		hexToRgb,
		rgbToHex,
		rgbToHsv,
		hsvToRgb,
		hsvToHsl,
		isValidHex,
		clamp
	} from '@dryui/primitives';
	import type { RGB, HSV } from '@dryui/primitives';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: string;
		alpha?: number;
		disabled?: boolean;
		width?: number;
		areaHeight?: number;
		children: Snippet;
	}

	let {
		value = $bindable('#ff0000'),
		alpha = $bindable(1),
		disabled = false,
		width,
		areaHeight,
		class: className,
		children,
		...rest
	}: Props = $props();

	let internalHsv = $state<HSV>(
		(() => {
			const initHex = isValidHex(value) ? value : '#ff0000';
			return rgbToHsv(hexToRgb(initHex));
		})()
	);

	const rgb = $derived(hsvToRgb(internalHsv));
	const hsl = $derived(hsvToHsl(internalHsv));
	const hex = $derived(rgbToHex(rgb));

	function updateHsv(hsv: HSV) {
		internalHsv = hsv;
		const newHex = rgbToHex(hsvToRgb(hsv));
		lastSyncedValue = newHex;
		value = newHex;
	}

	let lastSyncedValue = value;
	$effect.pre(() => {
		if (value !== lastSyncedValue && isValidHex(value)) {
			lastSyncedValue = value;
			internalHsv = rgbToHsv(hexToRgb(value));
		}
	});

	setColorPickerCtx({
		get hex() {
			return hex;
		},
		get rgb() {
			return rgb;
		},
		get hsv() {
			return internalHsv;
		},
		get hsl() {
			return hsl;
		},
		get alpha() {
			return alpha;
		},
		get disabled() {
			return disabled;
		},

		setFromHsv(hsv: HSV) {
			updateHsv({
				h: clamp(Math.round(hsv.h), 0, 360),
				s: clamp(Math.round(hsv.s), 0, 100),
				v: clamp(Math.round(hsv.v), 0, 100)
			});
		},

		setFromHex(newHex: string) {
			if (isValidHex(newHex)) {
				updateHsv(rgbToHsv(hexToRgb(newHex)));
			}
		},

		setFromRgb(newRgb: RGB) {
			updateHsv(rgbToHsv(newRgb));
		},

		setHue(h: number) {
			updateHsv({ ...internalHsv, h: clamp(Math.round(h), 0, 360) });
		},

		setSaturationValue(s: number, v: number) {
			updateHsv({
				...internalHsv,
				s: clamp(Math.round(s), 0, 100),
				v: clamp(Math.round(v), 0, 100)
			});
		},

		setAlpha(a: number) {
			alpha = clamp(a, 0, 1);
		}
	});

	let el = $state<HTMLDivElement>();

	$effect(() => {
		if (!el) return;
		if (width !== undefined) {
			el.style.setProperty('--dry-color-picker-width', `${width}px`);
			el.style.setProperty('--dry-color-picker-area-width', `${width}px`);
		} else {
			el.style.removeProperty('--dry-color-picker-width');
			el.style.removeProperty('--dry-color-picker-area-width');
		}
		if (areaHeight !== undefined) {
			el.style.setProperty('--dry-color-picker-area-height', `${areaHeight}px`);
		} else {
			el.style.removeProperty('--dry-color-picker-area-height');
		}
	});
</script>

<div
	bind:this={el}
	data-color-picker
	data-disabled={disabled || undefined}
	class={className}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-color-picker] {
		--dry-color-picker-width: 220px;
		--dry-color-picker-area-width: 200px;
		--dry-color-picker-area-height: 150px;
		--dry-color-picker-indicator-size: var(--dry-space-4);
		--dry-color-picker-indicator-border: var(--dry-color-bg-overlay);
		--dry-color-picker-indicator-shadow:
			0 0 0 1px color-mix(in srgb, var(--dry-color-text-strong) 30%, transparent),
			0 2px 4px color-mix(in srgb, var(--dry-color-text-strong) 30%, transparent);
		--dry-color-picker-slider-track-height: var(--dry-space-2_5);
		--dry-color-picker-slider-thumb-size: calc(var(--dry-space-4) + var(--dry-space-0_5));
		--dry-color-picker-slider-thumb-bg: var(--dry-color-bg-overlay);
		--dry-color-picker-slider-thumb-border: color-mix(
			in srgb,
			var(--dry-color-text-strong) 20%,
			transparent
		);
		--dry-color-picker-slider-thumb-shadow: 0 1px 4px
			color-mix(in srgb, var(--dry-color-text-strong) 30%, transparent);
		--dry-color-picker-slider-thumb-shadow-hover: 0 2px 6px
			color-mix(in srgb, var(--dry-color-text-strong) 35%, transparent);
		--dry-color-picker-swatch-size: var(--dry-space-8);
		--dry-color-picker-grid-light: var(--dry-color-bg-overlay);
		--dry-color-picker-grid-dark: color-mix(in srgb, var(--dry-color-text-strong) 8%, transparent);
		--dry-color-picker-grid-size: var(--dry-space-3);
		--dry-color-picker-surface-hover: var(--dry-color-bg-raised);

		container-type: inline-size;
		display: grid;
		grid-template-columns: var(--dry-color-picker-area-width);
		gap: var(--dry-space-3);
	}

	@container (max-width: 180px) {
		[data-color-picker] {
			gap: var(--dry-space-2);
		}
	}
</style>
