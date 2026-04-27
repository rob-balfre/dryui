<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { BlendMode } from '@dryui/primitives/aurora';
	import {
		getReducedMotionPreference,
		observeInViewport,
		observePageVisibility,
		observeReducedMotionPreference,
		registerPropertyOnce,
		supportsPropertyRegistration
	} from '@dryui/primitives';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		palette?: 'sunrise' | 'ocean' | 'forest' | 'cosmic' | readonly [string, string, string];
		speed?: 'slow' | 'normal' | 'fast' | number;
		motion?: 'auto' | 'never';
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
		motion = 'auto',
		intensity = 80,
		waviness = 50,
		colorSpace = 'srgb',
		blendMode,
		layerOpacity,
		children: childSnippet,
		class: className,
		style,
		...rest
	}: Props = $props();

	let rootNode = $state<HTMLElement | null>(null);
	let prefersReducedMotion = $state(false);
	let supportsAnimation = $state(false);
	let documentVisible = $state(true);
	let inViewport = $state(true);
	let animated = $derived.by(
		() =>
			motion !== 'never' &&
			supportsAnimation &&
			!prefersReducedMotion &&
			documentVisible &&
			inViewport
	);

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

	onMount(() => {
		supportsAnimation = supportsPropertyRegistration();
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

		const stopVisibility = observePageVisibility((visible) => {
			documentVisible = visible;
		});
		const stopMotion = observeReducedMotionPreference((matches) => {
			prefersReducedMotion = matches;
		});
		let stopViewport = () => {};
		if (rootNode) {
			stopViewport = observeInViewport(
				rootNode,
				(inView) => {
					inViewport = inView;
				},
				{ threshold: 0.12 }
			);
		}

		if (!supportsAnimation || getReducedMotionPreference()) {
			inViewport = true;
		}

		return () => {
			stopVisibility();
			stopMotion();
			stopViewport();
		};
	});

	let backdropEl = $state<HTMLDivElement>();

	$effect(() => {
		if (!rootNode) return;
		const node = rootNode;
		node.style.cssText = style || '';
		if (customPalette?.[0]) node.style.setProperty('--dry-aurora-color-1', customPalette[0]);
		else node.style.removeProperty('--dry-aurora-color-1');
		if (customPalette?.[1]) node.style.setProperty('--dry-aurora-color-2', customPalette[1]);
		else node.style.removeProperty('--dry-aurora-color-2');
		if (customPalette?.[2]) node.style.setProperty('--dry-aurora-color-3', customPalette[2]);
		else node.style.removeProperty('--dry-aurora-color-3');
		node.style.setProperty('--dry-aurora-duration', speedDuration);
		node.style.setProperty('--dry-aurora-intensity', String(Math.max(0, Math.min(100, intensity))));
		node.style.setProperty('--dry-aurora-waviness', String(Math.max(0, Math.min(100, waviness))));
	});

	$effect(() => {
		if (!backdropEl) return;
		const node = backdropEl;
		if (blendMode) node.style.setProperty('--_aurora-backdrop-blend', blendMode);
		else node.style.removeProperty('--_aurora-backdrop-blend');
		if (layerOpacity != null)
			node.style.setProperty('--_aurora-backdrop-opacity', String(layerOpacity));
		else node.style.removeProperty('--_aurora-backdrop-opacity');
	});
</script>

<div
	bind:this={rootNode}
	data-aurora
	class={className}
	data-palette={paletteName}
	data-animated={animated || undefined}
	data-reduced-motion={prefersReducedMotion || undefined}
	data-color-space={colorSpace}
	{...rest}
>
	<div bind:this={backdropEl} data-aurora-backdrop aria-hidden="true">
		<span data-aurora-layer data-layer="one"></span>
		<span data-aurora-layer data-layer="two"></span>
		<span data-aurora-layer data-layer="three"></span>
	</div>

	{#if childSnippet}
		<div data-aurora-content>
			{@render childSnippet()}
		</div>
	{/if}
</div>

<style>
	[data-aurora] {
		--dry-aurora-angle: 0deg;
		--dry-aurora-shift: 0%;
		--dry-aurora-duration: 18s;
		--dry-aurora-intensity: 80;
		--dry-aurora-waviness: 50;
		--dry-aurora-surface: linear-gradient(
			145deg,
			color-mix(in srgb, var(--dry-color-bg-base) 84%, var(--dry-color-bg-overlay)),
			color-mix(in srgb, var(--dry-color-bg-overlay) 92%, transparent)
		);
		--dry-aurora-color-1: rgba(120, 119, 255, 0.58);
		--dry-aurora-color-2: rgba(56, 189, 248, 0.48);
		--dry-aurora-color-3: rgba(244, 114, 182, 0.42);

		position: relative;
		overflow: hidden;
		isolation: isolate;
		border-radius: inherit;
		background: var(--dry-aurora-surface);
	}

	[data-aurora][data-palette='sunrise'] {
		--dry-aurora-color-1: rgba(251, 146, 60, 0.58);
		--dry-aurora-color-2: rgba(250, 204, 21, 0.45);
		--dry-aurora-color-3: rgba(244, 114, 182, 0.42);
	}

	[data-aurora][data-palette='ocean'] {
		--dry-aurora-color-1: rgba(34, 197, 94, 0.42);
		--dry-aurora-color-2: rgba(14, 165, 233, 0.55);
		--dry-aurora-color-3: rgba(59, 130, 246, 0.48);
	}

	[data-aurora][data-palette='forest'] {
		--dry-aurora-color-1: rgba(34, 197, 94, 0.48);
		--dry-aurora-color-2: rgba(132, 204, 22, 0.42);
		--dry-aurora-color-3: rgba(16, 185, 129, 0.44);
	}

	[data-aurora][data-palette='cosmic'] {
		--dry-aurora-color-1: rgba(167, 139, 250, 0.6);
		--dry-aurora-color-2: rgba(56, 189, 248, 0.5);
		--dry-aurora-color-3: rgba(236, 72, 153, 0.42);
	}

	[data-aurora][data-palette='custom'] {
		--dry-aurora-color-1: rgba(56, 189, 248, 0.5);
		--dry-aurora-color-2: rgba(99, 102, 241, 0.48);
		--dry-aurora-color-3: rgba(20, 184, 166, 0.42);
	}

	[data-aurora-backdrop] {
		position: absolute;
		inset: 0;
		overflow: hidden;
		border-radius: inherit;
		z-index: 0;
		mix-blend-mode: var(--_aurora-backdrop-blend, normal);
		opacity: var(--_aurora-backdrop-opacity, 1);
	}

	[data-aurora-layer] {
		position: absolute;
		inset: -18%;
		border-radius: 50%;
		opacity: calc(0.92 * var(--dry-aurora-intensity, 80) / 80);
		transform: translate3d(var(--dry-aurora-shift), 0, 0) rotate(var(--dry-aurora-angle));
		transform-origin: center;
		mix-blend-mode: screen;
	}

	[data-aurora-layer][data-layer='one'] {
		background:
			radial-gradient(ellipse 70% 28% at 20% 35%, var(--dry-aurora-color-1) 0, transparent 62%),
			radial-gradient(ellipse 50% 40% at 45% 55%, var(--dry-aurora-color-1) 0, transparent 58%);
		filter: blur(calc(40px * (0.5 + var(--dry-aurora-waviness, 50) / 100)));
	}

	[data-aurora-layer][data-layer='two'] {
		background:
			radial-gradient(ellipse 65% 32% at 72% 28%, var(--dry-aurora-color-2) 0, transparent 60%),
			radial-gradient(ellipse 55% 36% at 38% 68%, var(--dry-aurora-color-2) 0, transparent 56%);
		filter: blur(calc(64px * (0.5 + var(--dry-aurora-waviness, 50) / 100)));
	}

	[data-aurora-layer][data-layer='three'] {
		background:
			radial-gradient(ellipse 60% 30% at 58% 78%, var(--dry-aurora-color-3) 0, transparent 64%),
			radial-gradient(ellipse 48% 38% at 25% 42%, var(--dry-aurora-color-3) 0, transparent 54%);
		filter: blur(calc(52px * (0.5 + var(--dry-aurora-waviness, 50) / 100)));
	}

	[data-aurora][data-animated] [data-aurora-layer] {
		will-change: transform, opacity;
	}

	[data-aurora][data-animated] [data-aurora-layer][data-layer='one'] {
		animation: aurora-one var(--dry-aurora-duration) var(--dry-ease-spring-soft) infinite alternate;
	}

	[data-aurora][data-animated] [data-aurora-layer][data-layer='two'] {
		animation: aurora-two calc(var(--dry-aurora-duration) * 1.37) var(--dry-ease-spring-soft)
			infinite alternate;
	}

	[data-aurora][data-animated] [data-aurora-layer][data-layer='three'] {
		animation: aurora-three calc(var(--dry-aurora-duration) * 0.79) var(--dry-ease-spring-soft)
			infinite alternate;
	}

	[data-aurora][data-reduced-motion] [data-aurora-layer] {
		animation: none;
		transform: none;
	}

	[data-aurora-backdrop]::after {
		content: '';
		position: absolute;
		inset: -10%;
		border-radius: 50%;
		pointer-events: none;
		background: radial-gradient(
			ellipse 80% 50% at 50% 50%,
			var(--dry-aurora-color-1) 0,
			transparent 70%
		);
		mix-blend-mode: soft-light;
		filter: blur(60px);
		opacity: calc(0.35 * var(--dry-aurora-intensity, 80) / 80);
	}

	[data-aurora][data-animated] [data-aurora-backdrop]::after {
		will-change: opacity, transform;
		animation: aurora-glow calc(var(--dry-aurora-duration) * 1.8) ease-in-out infinite alternate;
	}

	[data-aurora][data-reduced-motion] [data-aurora-backdrop]::after {
		animation: none;
	}

	/* oklch color space */
	[data-aurora][data-color-space='oklch'] [data-aurora-layer][data-layer='one'] {
		background:
			radial-gradient(
				ellipse 70% 28% at 20% 35%,
				color-mix(in oklch, var(--dry-aurora-color-1) 100%, transparent) 0,
				transparent 62%
			),
			radial-gradient(
				ellipse 50% 40% at 45% 55%,
				color-mix(in oklch, var(--dry-aurora-color-1) 100%, transparent) 0,
				transparent 58%
			);
	}

	[data-aurora][data-color-space='oklch'] [data-aurora-layer][data-layer='two'] {
		background:
			radial-gradient(
				ellipse 65% 32% at 72% 28%,
				color-mix(in oklch, var(--dry-aurora-color-2) 100%, transparent) 0,
				transparent 60%
			),
			radial-gradient(
				ellipse 55% 36% at 38% 68%,
				color-mix(in oklch, var(--dry-aurora-color-2) 100%, transparent) 0,
				transparent 56%
			);
	}

	[data-aurora][data-color-space='oklch'] [data-aurora-layer][data-layer='three'] {
		background:
			radial-gradient(
				ellipse 60% 30% at 58% 78%,
				color-mix(in oklch, var(--dry-aurora-color-3) 100%, transparent) 0,
				transparent 64%
			),
			radial-gradient(
				ellipse 48% 38% at 25% 42%,
				color-mix(in oklch, var(--dry-aurora-color-3) 100%, transparent) 0,
				transparent 54%
			);
	}

	/* oklab color space */
	[data-aurora][data-color-space='oklab'] [data-aurora-layer][data-layer='one'] {
		background:
			radial-gradient(
				ellipse 70% 28% at 20% 35%,
				color-mix(in oklab, var(--dry-aurora-color-1) 100%, transparent) 0,
				transparent 62%
			),
			radial-gradient(
				ellipse 50% 40% at 45% 55%,
				color-mix(in oklab, var(--dry-aurora-color-1) 100%, transparent) 0,
				transparent 58%
			);
	}

	[data-aurora][data-color-space='oklab'] [data-aurora-layer][data-layer='two'] {
		background:
			radial-gradient(
				ellipse 65% 32% at 72% 28%,
				color-mix(in oklab, var(--dry-aurora-color-2) 100%, transparent) 0,
				transparent 60%
			),
			radial-gradient(
				ellipse 55% 36% at 38% 68%,
				color-mix(in oklab, var(--dry-aurora-color-2) 100%, transparent) 0,
				transparent 56%
			);
	}

	[data-aurora][data-color-space='oklab'] [data-aurora-layer][data-layer='three'] {
		background:
			radial-gradient(
				ellipse 60% 30% at 58% 78%,
				color-mix(in oklab, var(--dry-aurora-color-3) 100%, transparent) 0,
				transparent 64%
			),
			radial-gradient(
				ellipse 48% 38% at 25% 42%,
				color-mix(in oklab, var(--dry-aurora-color-3) 100%, transparent) 0,
				transparent 54%
			);
	}

	[data-aurora-content] {
		position: relative;
		z-index: 1;
	}

	@keyframes aurora-one {
		0% {
			transform: translate3d(-8%, -4%, 0) rotate(-6deg) scaleX(1);
		}
		50% {
			transform: translate3d(2%, 3%, 0) rotate(1deg) scaleX(1.08);
		}
		100% {
			transform: translate3d(10%, 7%, 0) rotate(7deg) scaleX(0.95);
		}
	}

	@keyframes aurora-two {
		0% {
			transform: translate3d(6%, -8%, 0) rotate(4deg) scaleX(0.96);
		}
		50% {
			transform: translate3d(-3%, 2%, 0) rotate(-2deg) scaleX(1.06);
		}
		100% {
			transform: translate3d(-10%, 10%, 0) rotate(-8deg) scaleX(1.02);
		}
	}

	@keyframes aurora-three {
		0% {
			transform: translate3d(-4%, 10%, 0) rotate(8deg) scaleX(1.04);
		}
		50% {
			transform: translate3d(4%, -4%, 0) rotate(-1deg) scaleX(0.92);
		}
		100% {
			transform: translate3d(8%, -10%, 0) rotate(-5deg) scaleX(1.1);
		}
	}

	@keyframes aurora-glow {
		0% {
			opacity: 0.25;
			transform: scale(0.95);
		}
		100% {
			opacity: 0.45;
			transform: scale(1.08);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		[data-aurora-layer] {
			animation: none;
			transform: none;
		}

		[data-aurora-backdrop]::after {
			animation: none;
		}
	}
</style>
