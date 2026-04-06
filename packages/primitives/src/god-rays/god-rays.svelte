<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { BlendMode } from '../internal/blend-modes.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		color?: string;
		rayCount?: number;
		intensity?: number;
		center?: { x: number; y: number };
		speed?: number;
		blendMode?: BlendMode;
		children?: Snippet;
	}

	let {
		color = 'rgba(255, 255, 255, 0.15)',
		rayCount = 12,
		intensity = 60,
		center = { x: 0.5, y: 0 },
		speed = 0,
		blendMode = 'screen',
		children,
		class: className,
		style,
		...rest
	}: Props = $props();

	const clampedIntensity = $derived(`${Math.max(0, Math.min(100, intensity))}`);
	const cx = $derived(`${Math.max(0, Math.min(1, center.x)) * 100}%`);
	const cy = $derived(`${Math.max(0, Math.min(1, center.y)) * 100}%`);
	const speedValue = $derived(speed > 0 ? `${speed}s` : '0s');

	const gradientString = $derived.by(() => {
		const count = Math.max(1, Math.min(36, rayCount));
		const sliceDeg = 360 / count;
		const rayDeg = sliceDeg * 0.4;
		const stops: string[] = [];
		for (let i = 0; i < count; i++) {
			const start = i * sliceDeg;
			stops.push(`var(--dry-rays-color) ${start}deg`);
			stops.push(`var(--dry-rays-color) ${start + rayDeg}deg`);
			stops.push(`transparent ${start + rayDeg}deg`);
			stops.push(`transparent ${start + sliceDeg}deg`);
		}
		return `conic-gradient(from 0deg at var(--dry-rays-cx) var(--dry-rays-cy), ${stops.join(', ')})`;
	});

	function applyRootStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
			node.style.setProperty('--dry-rays-color', color);
			node.style.setProperty('--dry-rays-cx', cx);
			node.style.setProperty('--dry-rays-cy', cy);
			node.style.setProperty('--dry-rays-intensity', clampedIntensity);
			node.style.setProperty('--dry-rays-blend', blendMode);
			node.style.setProperty('--dry-rays-speed', speedValue);
		});
	}

	function applyLayerStyles(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('background', gradientString);
		});
	}
</script>

<div
	class={['god-rays', className]}
	data-animated={speed > 0 ? '' : undefined}
	{...rest}
	use:applyRootStyles
>
	<div class="god-rays-layer" use:applyLayerStyles></div>
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	.god-rays {
		position: relative;
		overflow: hidden;
	}

	.god-rays-layer {
		position: absolute;
		inset: -20%;
		pointer-events: none;
	}
</style>
