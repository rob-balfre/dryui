<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		getReducedMotionPreference,
		observeReducedMotionPreference,
		registerPropertyOnce,
		supportsPropertyRegistration
	} from '../internal/motion.js';
	import type { BlendMode } from '../internal/blend-modes.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		palette?: 'sunrise' | 'ocean' | 'forest' | 'cosmic' | readonly [string, string, string];
		speed?: 'slow' | 'normal' | 'fast' | number;
		intensity?: number;
		waviness?: number;
		colorSpace?: 'srgb' | 'oklch' | 'oklab';
		blendMode?: BlendMode;
		layerOpacity?: number;

		children?: Snippet;
	}

	let {
		palette = 'cosmic',
		speed = 'normal',
		intensity = 80,
		waviness = 50,
		colorSpace = 'srgb',
		blendMode,
		layerOpacity,
		children,
		class: className,
		style,
		...rest
	}: Props = $props();

	let prefersReducedMotion = $state(false);
	let animated = $state(false);

	const speedDuration = $derived.by(() => {
		if (typeof speed === 'number' && Number.isFinite(speed) && speed > 0) {
			return `${(18 / speed).toFixed(2)}s`;
		}

		if (speed === 'fast') return '12s';
		if (speed === 'slow') return '26s';
		return '18s';
	});

	const paletteName = $derived(typeof palette === 'string' ? palette : 'custom');
	const customPalette = $derived(Array.isArray(palette) ? palette : null);

	$effect(() => {
		registerPropertyOnce({
			name: '--dry-aurora-angle',
			syntax: '<angle>',
			inherits: false,
			initialValue: '0deg'
		});
		registerPropertyOnce({
			name: '--dry-aurora-shift',
			syntax: '<percentage>',
			inherits: false,
			initialValue: '0%'
		});

		const updateAnimatedState = (matches: boolean) => {
			prefersReducedMotion = matches;
			animated = !matches && supportsPropertyRegistration();
		};

		const stopMotionObserver = observeReducedMotionPreference(updateAnimatedState);

		if (!supportsPropertyRegistration() || getReducedMotionPreference()) {
			animated = false;
			return stopMotionObserver;
		}

		animated = true;
		return stopMotionObserver;
	});

	function applyRootStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
			if (customPalette?.[0]) node.style.setProperty('--dry-aurora-color-1', customPalette[0]);
			if (customPalette?.[1]) node.style.setProperty('--dry-aurora-color-2', customPalette[1]);
			if (customPalette?.[2]) node.style.setProperty('--dry-aurora-color-3', customPalette[2]);
			node.style.setProperty('--dry-aurora-duration', speedDuration);
			node.style.setProperty(
				'--dry-aurora-intensity',
				String(Math.max(0, Math.min(100, intensity)))
			);
			node.style.setProperty('--dry-aurora-waviness', String(Math.max(0, Math.min(100, waviness))));
		});
	}

	function applyBackdropStyles(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('mix-blend-mode', blendMode ?? '');
			node.style.setProperty('opacity', layerOpacity != null ? String(layerOpacity) : '');
		});
	}
</script>

<div
	class={['aurora', className]}
	data-palette={paletteName}
	data-animated={animated || undefined}
	data-reduced-motion={prefersReducedMotion || undefined}
	data-color-space={colorSpace}
	{...rest}
	use:applyRootStyles
>
	<div class="aurora-backdrop" aria-hidden="true" use:applyBackdropStyles>
		<span class="aurora-layer" data-layer="one"></span>
		<span class="aurora-layer" data-layer="two"></span>
		<span class="aurora-layer" data-layer="three"></span>
	</div>

	{#if children}
		<div class="aurora-content">
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.aurora {
		position: relative;
		overflow: hidden;
		isolation: isolate;
	}

	.aurora-backdrop {
		position: absolute;
		inset: 0;
		overflow: hidden;
		border-radius: inherit;
		z-index: 0;
	}

	.aurora-layer {
		position: absolute;
		inset: -18%;
	}

	.aurora-content {
		position: relative;
		z-index: 1;
	}
</style>
