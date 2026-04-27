<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { BlendMode } from '@dryui/primitives/beam';
	import { observeOffscreenState } from '@dryui/primitives';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
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

	let el = $state<HTMLDivElement>();

	$effect(() => {
		if (!el) return;
		const node = el;
		node.style.cssText = style || '';
		node.style.setProperty('--dry-beam-color', color);
		node.style.setProperty('--dry-beam-angle', `${angle}deg`);
		node.style.setProperty('--dry-beam-speed', speedValue);
		node.style.setProperty('--dry-beam-intensity', clampedIntensity);
		node.style.setProperty('--dry-beam-width', `${width}px`);
		if (blendMode) node.style.setProperty('--dry-beam-blend', blendMode);
		else node.style.removeProperty('--dry-beam-blend');
	});

	$effect(() => {
		if (!el) return;
		return observeOffscreenState(el, { rootMargin: '200px' });
	});
</script>

<div bind:this={el} data-beam class={className} {...rest}>
	<div data-beam-layer></div>
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	[data-beam] {
		--dry-beam-color: var(--dry-color-fill-brand);
		--dry-beam-angle: 45deg;
		--dry-beam-speed: 3s;
		--dry-beam-intensity: 70;
		--dry-beam-width: 2px;

		position: relative;
		overflow: hidden;
		border-radius: inherit;
		contain: content;
	}

	[data-beam-layer] {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
		opacity: calc(var(--dry-beam-intensity, 70) / 100);
		mix-blend-mode: var(--dry-beam-blend, var(--dry-beam-default-blend, multiply));
	}

	[data-beam-layer]::before {
		content: '';
		position: absolute;
		inset: -100%;
		background-image: linear-gradient(
			var(--dry-beam-angle, 45deg),
			transparent 0%,
			transparent calc(50% - var(--dry-beam-width, 2px)),
			var(--dry-beam-color, var(--dry-color-fill-brand)) 50%,
			transparent calc(50% + var(--dry-beam-width, 2px)),
			transparent 100%
		);
		filter: blur(calc(var(--dry-beam-width, 2px) * 2));
		animation: beam-sweep var(--dry-beam-speed, 3s) ease-in-out infinite;
		backface-visibility: hidden;
	}

	[data-beam]:not([data-offscreen]) [data-beam-layer]::before {
		will-change: transform, filter;
	}

	[data-beam][data-offscreen] [data-beam-layer]::before {
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
		[data-beam-layer]::before {
			animation: none;
			transform: translate(0, 0);
		}
	}
</style>
