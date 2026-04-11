<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		dotSize?: 'fine' | 'medium' | 'coarse' | number;
		angle?: number;
		color?: string;
		opacity?: number;
		children?: Snippet;
	}

	let {
		dotSize = 'medium',
		angle = 45,
		color = 'currentColor',
		opacity = 0.3,
		children,
		class: className,
		...rest
	}: Props = $props();

	const dotSizeName = $derived(
		dotSize === 'fine' || dotSize === 'medium' || dotSize === 'coarse' ? dotSize : 'custom'
	);

	const baseSize = $derived(
		typeof dotSize === 'number'
			? Math.max(1, dotSize)
			: dotSize === 'fine'
				? 2
				: dotSize === 'coarse'
					? 6
					: 4
	);
	const patternSize = $derived(`${baseSize * 3}`);
	const dotRadius = $derived(`${baseSize * 0.45}`);

	const normalizedOpacity = $derived(`${Math.max(0, Math.min(1, opacity))}`);
	const angleValue = $derived(`${angle}deg`);

	function setHalftoneVars(node: HTMLDivElement) {
		$effect(() => {
			node.style.setProperty('--dry-halftone-pattern-size', patternSize);
			node.style.setProperty('--dry-halftone-dot-radius', dotRadius);
			node.style.setProperty('--dry-halftone-color', color);
			node.style.setProperty('--dry-halftone-opacity', normalizedOpacity);
			node.style.setProperty('--dry-halftone-angle', angleValue);
		});
	}
</script>

<div
	{@attach setHalftoneVars}
	class={className}
	data-halftone
	data-dot-size={dotSizeName}
	{...rest}
>
	{#if children}
		<div data-halftone-content>
			{@render children()}
		</div>
	{/if}
</div>

<style>
	[data-halftone] {
		--dry-halftone-pattern-size: 12;
		--dry-halftone-dot-radius: 1.8;
		--dry-halftone-color: currentColor;
		--dry-halftone-opacity: 0.3;
		--dry-halftone-angle: 45deg;

		position: relative;
		isolation: isolate;
		border-radius: inherit;
		overflow: hidden;
	}

	[data-halftone]::after {
		content: '';
		position: absolute;
		inset: -10%;
		pointer-events: none;
		opacity: var(--dry-halftone-opacity);
		mix-blend-mode: multiply;
		transform: rotate(var(--dry-halftone-angle));
		transform-origin: center;
		background-image: radial-gradient(
			circle at center,
			var(--dry-halftone-color) 0 calc(var(--dry-halftone-dot-radius) * 1px),
			transparent calc((var(--dry-halftone-dot-radius) * 1px) + 0.8px)
		);
		background-size: calc(var(--dry-halftone-pattern-size) * 1px)
			calc(var(--dry-halftone-pattern-size) * 1px);
		background-repeat: repeat;
	}

	[data-halftone-content] {
		position: relative;
		z-index: 1;
	}
</style>
