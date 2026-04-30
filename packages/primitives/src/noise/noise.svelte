<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { observeReducedMotionPreference } from '../internal/motion.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		opacity?: number;
		blend?: 'soft-light' | 'overlay' | 'multiply';
		animated?: boolean;
		grain?: 'fine' | 'medium' | 'coarse';
		children?: Snippet;
	}

	let {
		opacity = 0.22,
		blend = 'overlay',
		animated = false,
		grain = 'medium',
		children,
		class: className,
		style,
		...rest
	}: Props = $props();

	let prefersReducedMotion = $state(false);

	$effect(() =>
		observeReducedMotionPreference((matches) => {
			prefersReducedMotion = matches;
		})
	);

	const normalizedOpacity = $derived(`${Math.max(0, Math.min(1, opacity))}`);
	const shouldAnimate = $derived(animated && !prefersReducedMotion);

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
			node.style.setProperty('--dry-noise-opacity', normalizedOpacity);
			node.style.setProperty('--dry-noise-blend', blend);
		});
	}
</script>

<div
	class={['noise', className]}
	data-animated={shouldAnimate || undefined}
	data-reduced-motion={prefersReducedMotion || undefined}
	data-grain={grain}
	{...rest}
	use:applyStyles
>
	<span class="noise-texture" aria-hidden="true"></span>

	{#if children}
		<div class="noise-content">
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.noise {
		position: relative;
		isolation: isolate;
		overflow: hidden;
	}

	.noise-texture {
		position: absolute;
		inset: -24%;
		pointer-events: none;
	}

	.noise-content {
		position: relative;
		z-index: 1;
	}
</style>
