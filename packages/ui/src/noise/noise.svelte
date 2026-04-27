<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		observeInViewport,
		observePageVisibility,
		observeReducedMotionPreference
	} from '@dryui/primitives';

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
		children: childSnippet,
		class: className,
		style,
		...rest
	}: Props = $props();

	let prefersReducedMotion = $state(false);
	let onScreen = $state(true);
	let tabVisible = $state(true);

	onMount(() => {
		const stopMotion = observeReducedMotionPreference((matches) => {
			prefersReducedMotion = matches;
		});
		const stopVisibility = observePageVisibility((visible) => {
			tabVisible = visible;
		});
		return () => {
			stopMotion();
			stopVisibility();
		};
	});

	const normalizedOpacity = $derived(`${Math.max(0, Math.min(1, opacity))}`);
	const shouldAnimate = $derived(animated && !prefersReducedMotion);
	const paused = $derived(!onScreen || !tabVisible);

	let el = $state<HTMLDivElement>();

	$effect(() => {
		if (!el) return;
		el.style.cssText = style || '';
		el.style.setProperty('--dry-noise-opacity', normalizedOpacity);
		el.style.setProperty('--dry-noise-blend', blend);
	});

	$effect(() => {
		if (!el) return;
		return observeInViewport(
			el,
			(inView) => {
				onScreen = inView;
			},
			{ rootMargin: '200px' }
		);
	});
</script>

<div
	bind:this={el}
	class={className}
	data-noise
	data-animated={shouldAnimate || undefined}
	data-reduced-motion={prefersReducedMotion || undefined}
	data-paused={paused || undefined}
	data-grain={grain}
	{...rest}
>
	<span data-noise-texture aria-hidden="true"></span>

	{#if childSnippet}
		<div data-noise-content>
			{@render childSnippet()}
		</div>
	{/if}
</div>

<style>
	[data-noise] {
		--dry-noise-opacity: 0.22;
		--dry-noise-blend: overlay;
		--dry-noise-pattern: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='discrete' tableValues='0 0.15 0.85 1'/%3E%3CfeFuncG type='discrete' tableValues='0 0.15 0.85 1'/%3E%3CfeFuncB type='discrete' tableValues='0 0.15 0.85 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)' opacity='0.9'/%3E%3C/svg%3E");

		position: relative;
		isolation: isolate;
		overflow: hidden;
		border-radius: inherit;
	}

	/* Grain sizes */
	[data-noise][data-grain='fine'] {
		--dry-noise-pattern: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='discrete' tableValues='0 0.15 0.85 1'/%3E%3CfeFuncG type='discrete' tableValues='0 0.15 0.85 1'/%3E%3CfeFuncB type='discrete' tableValues='0 0.15 0.85 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)' opacity='0.9'/%3E%3C/svg%3E");
	}

	[data-noise][data-grain='coarse'] {
		--dry-noise-pattern: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.35' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='discrete' tableValues='0 0.15 0.85 1'/%3E%3CfeFuncG type='discrete' tableValues='0 0.15 0.85 1'/%3E%3CfeFuncB type='discrete' tableValues='0 0.15 0.85 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)' opacity='0.9'/%3E%3C/svg%3E");
	}

	[data-noise-texture] {
		position: absolute;
		inset: -24%;
		z-index: 2;
		pointer-events: none;
		opacity: var(--dry-noise-opacity);
		mix-blend-mode: var(--dry-noise-blend);
		background-image: var(--dry-noise-pattern);
		background-size: 256px 256px;
		background-repeat: repeat;
	}

	[data-noise][data-animated] [data-noise-texture] {
		animation: noise-drift 1.6s steps(6) infinite;
	}

	[data-noise][data-animated]:not([data-paused]) [data-noise-texture] {
		will-change: transform;
	}

	[data-noise][data-animated][data-paused] [data-noise-texture] {
		animation-play-state: paused;
	}

	[data-noise][data-reduced-motion] [data-noise-texture] {
		animation: none;
	}

	[data-noise-content] {
		position: relative;
		z-index: 1;
	}

	@keyframes noise-drift {
		0% {
			transform: translate3d(0, 0, 0);
		}

		16.67% {
			transform: translate3d(-3%, 2%, 0);
		}

		33.33% {
			transform: translate3d(2%, -3%, 0);
		}

		50% {
			transform: translate3d(-1%, -2%, 0);
		}

		66.67% {
			transform: translate3d(4%, 1%, 0);
		}

		83.33% {
			transform: translate3d(-2%, 3%, 0);
		}

		100% {
			transform: translate3d(0, 0, 0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		[data-noise-texture] {
			animation: none;
		}
	}
</style>
