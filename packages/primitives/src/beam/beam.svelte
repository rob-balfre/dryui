<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { BlendMode } from '../internal/blend-modes.js';

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
		blendMode = 'screen',
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
			node.style.setProperty('--dry-beam-blend', blendMode);
			node.style.setProperty('--dry-beam-width', `${width}px`);
		});
	}

	function applyLayerStyles(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('background', gradientString);
		});
	}
</script>

<div class={['beam', className]} {...rest} use:applyRootStyles>
	<div class="beam-layer" use:applyLayerStyles></div>
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
	}
</style>
