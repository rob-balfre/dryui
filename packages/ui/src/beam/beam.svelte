<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { BlendMode } from '@dryui/primitives/beam';

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
	const gradientString = $derived(
		`linear-gradient(${angle}deg, transparent 0%, transparent calc(50% - ${width}px), ${color} 50%, transparent calc(50% + ${width}px), transparent 100%)`
	);
	const rootStyle = $derived.by(() => {
		const declarations = [
			style,
			`--dry-beam-speed: ${speedValue}`,
			`--dry-beam-intensity: ${clampedIntensity}`,
			`--dry-beam-width: ${width}px`,
			blendMode ? `--dry-beam-blend: ${blendMode}` : null
		].filter(Boolean);
		return declarations.join('; ');
	});
	const layerStyle = $derived(`background-image: ${gradientString};`);

	function applyRootStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = rootStyle;
		});
	}

	function applyLayerStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = layerStyle;
		});
	}
</script>

<div data-beam class={className} {...rest} {@attach applyRootStyles}>
	<div data-beam-layer {@attach applyLayerStyles}></div>
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	[data-beam] {
		position: relative;
		overflow: hidden;
		border-radius: inherit;
	}

	[data-beam-layer] {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background-size: 300% 300%;
		opacity: calc(var(--dry-beam-intensity, 70) / 100);
		mix-blend-mode: var(--dry-beam-blend, var(--dry-beam-default-blend, multiply));
		filter: blur(calc(var(--dry-beam-width, 2px) * 2));
		animation: beam-sweep var(--dry-beam-speed, 3s) ease-in-out infinite;
	}

	@keyframes beam-sweep {
		0% {
			background-position: -50% -50%;
		}
		100% {
			background-position: 150% 150%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		[data-beam-layer] {
			animation: none;
			background-position: 50% 50%;
		}
	}
</style>
