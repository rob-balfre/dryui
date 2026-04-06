<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setColorPickerCtx } from './context.svelte.js';
	import {
		hexToRgb,
		rgbToHex,
		rgbToHsv,
		hsvToRgb,
		rgbToHsl,
		hsvToHsl,
		isValidHex,
		clamp
	} from './color-utils.js';
	import type { RGB, HSV } from './color-utils.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: string;
		alpha?: number;
		disabled?: boolean;
		children: Snippet;
	}

	let {
		value = $bindable('#ff0000'),
		alpha = $bindable(1),
		disabled = false,
		children,
		...rest
	}: Props = $props();

	// HSV is source of truth
	let internalHsv = $state<HSV>(
		(() => {
			const initHex = isValidHex(value) ? value : '#ff0000';
			return rgbToHsv(hexToRgb(initHex));
		})()
	);

	const rgb = $derived<RGB>(hsvToRgb(internalHsv));
	const hsl = $derived(hsvToHsl(internalHsv));
	const hex = $derived(rgbToHex(rgb));

	// Update internalHsv AND sync value to parent in one step
	function updateHsv(hsv: HSV) {
		internalHsv = hsv;
		const newHex = rgbToHex(hsvToRgb(hsv));
		lastSyncedValue = newHex;
		value = newHex;
	}

	// Sync from parent when value prop changes externally
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
</script>

<div data-disabled={disabled || undefined} {...rest}>
	{@render children()}
</div>
