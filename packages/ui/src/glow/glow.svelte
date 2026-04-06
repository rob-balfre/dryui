<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		color?: string;
		intensity?: number;
		radius?: number;
		blendMode?: string;
		children: Snippet;
	}

	let {
		color = 'var(--dry-color-fill-brand)',
		intensity = 50,
		radius = 20,
		blendMode = 'screen',
		children,
		class: className,
		style,
		...rest
	}: Props = $props();

	const clampedIntensity = $derived(`${Math.max(0, Math.min(100, intensity))}`);
	const radiusValue = $derived(`${Math.max(0, radius)}px`);

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
			node.style.setProperty('--dry-glow-color', color);
			node.style.setProperty('--dry-glow-intensity', clampedIntensity);
			node.style.setProperty('--dry-glow-radius', radiusValue);
			node.style.setProperty('--dry-glow-blend', blendMode);
		});
	}
</script>

<div class={className} data-glow {...rest} use:applyStyles>
	{@render children()}
</div>

<style>
	[data-glow] {
		--dry-glow-color: var(--dry-color-fill-brand);
		--dry-glow-intensity: 50;
		--dry-glow-radius: 20px;
		--dry-glow-blend: screen;

		position: relative;
		border-radius: inherit;
	}

	[data-glow]::before {
		content: '';
		position: absolute;
		inset: calc(var(--dry-glow-radius, 20px) * -0.5);
		border-radius: inherit;
		background: var(--dry-glow-color, var(--dry-color-fill-brand));
		opacity: calc(var(--dry-glow-intensity, 50) / 100);
		filter: blur(var(--dry-glow-radius, 20px));
		mix-blend-mode: var(--dry-glow-blend, screen);
		pointer-events: none;
		z-index: -1;
	}
</style>
