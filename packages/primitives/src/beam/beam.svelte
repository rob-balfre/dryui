<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { BlendMode } from '../internal/blend-modes.js';
	import { observeOffscreenState } from '../internal/motion.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		color?: string;
		width?: number;
		angle?: number;
		speed?: number;
		intensity?: number;
		blendMode?: BlendMode;
		children?: Snippet;
	}

	let {
		color = 'var(--dry-color-fill-brand)',
		width = 2,
		angle = 45,
		speed = 3,
		intensity = 70,
		blendMode,
		children,
		class: className,
		style,
		...rest
	}: Props = $props();

	const clampedIntensity = $derived(`${Math.max(0, Math.min(100, intensity))}`);
	const speedValue = $derived(`${Math.max(0, speed)}s`);
	const gradientString = $derived(
		`linear-gradient(${angle}deg, transparent 0%, transparent calc(50% - ${width}px), ${color} 50%, transparent calc(50% + ${width}px), transparent 100%)`
	);

	function applyRootStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
			node.style.setProperty('--dry-beam-speed', speedValue);
			node.style.setProperty('--dry-beam-intensity', clampedIntensity);
			node.style.setProperty('--dry-beam-width', `${width}px`);
			if (blendMode) node.style.setProperty('--dry-beam-blend', blendMode);
			else node.style.removeProperty('--dry-beam-blend');
		});

		$effect(() => observeOffscreenState(node, { rootMargin: '200px' }));
	}

	function applyLayerStyles(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('--_dry-beam-gradient', gradientString);
		});
	}
</script>

<div class={['beam', className]} {...rest} {@attach applyRootStyles}>
	<div class="beam-layer" {@attach applyLayerStyles}></div>
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	.beam {
		position: relative;
	}

	.beam-layer {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
		opacity: calc(var(--dry-beam-intensity, 70) / 100);
		mix-blend-mode: var(--dry-beam-blend, var(--dry-beam-default-blend, multiply));
	}

	.beam-layer::before {
		content: '';
		position: absolute;
		inset: -100%;
		background: var(--_dry-beam-gradient);
		filter: blur(calc(var(--dry-beam-width, 2px) * 2));
		animation: beam-sweep var(--dry-beam-speed, 3s) ease-in-out infinite;
		backface-visibility: hidden;
	}

	.beam:not([data-offscreen]) .beam-layer::before {
		will-change: transform, filter;
	}

	.beam[data-offscreen] .beam-layer::before {
		animation-play-state: paused;
	}

	@keyframes beam-sweep {
		from {
			transform: translate(-33.333%, -33.333%);
		}
		to {
			transform: translate(33.333%, 33.333%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.beam-layer::before {
			animation: none;
			transform: translate(0, 0);
		}
	}
</style>
