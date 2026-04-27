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
		scale?: number;
		turbulence?: 'gentle' | 'medium' | 'rough';
		animated?: boolean;
		children: Snippet;
	}

	let {
		scale = 12,
		turbulence = 'medium',
		animated = false,
		children: childSnippet,
		class: className,
		style,
		...rest
	}: Props = $props();

	const filterId = `dry-displacement-${Math.random().toString(36).slice(2, 8)}`;
	let element = $state<HTMLDivElement>();
	let seed = $state(1);
	let prefersReducedMotion = $state(false);
	let documentVisible = $state(true);
	let inViewport = $state(true);

	const baseFrequency = $derived.by(() => {
		if (turbulence === 'gentle') return '0.015';
		if (turbulence === 'rough') return '0.04';
		return '0.025';
	});

	const scaleValue = $derived(`${Math.max(0, scale)}`);
	const shouldAnimate = $derived(
		animated && !prefersReducedMotion && documentVisible && inViewport
	);

	onMount(() => {
		const stopMotion = observeReducedMotionPreference((matches) => {
			prefersReducedMotion = matches;
		});
		const stopVisibility = observePageVisibility((visible) => {
			documentVisible = visible;
		});

		let frameId: number | undefined;
		let lastTime = 0;
		const FPS_INTERVAL = 1000 / 12;

		function animate(time: number) {
			if (!shouldAnimate) return;
			if (time - lastTime >= FPS_INTERVAL) {
				seed = Math.floor(Math.random() * 9999) + 1;
				lastTime = time;
			}
			frameId = requestAnimationFrame(animate);
		}

		$effect(() => {
			if (shouldAnimate) {
				frameId = requestAnimationFrame(animate);
			}
			return () => {
				if (frameId !== undefined) {
					cancelAnimationFrame(frameId);
					frameId = undefined;
				}
			};
		});

		$effect(() => {
			if (!element) return;
			return observeInViewport(element, (inView) => {
				inViewport = inView;
			});
		});

		return () => {
			stopMotion();
			stopVisibility();
		};
	});

	// Flash-on-load: filter references a runtime-generated SVG filter ID (url(#${filterId})),
	// so no CSS default is possible — the ID isn't known until mount. The SVG <filter> element
	// is in the same template, so the $effect sets it immediately on first paint.
	$effect(() => {
		if (!element) return;
		element.style.cssText = style || '';
		element.style.setProperty('filter', `url(#${filterId})`);
	});
</script>

<svg data-displacement-svg width="0" height="0" aria-hidden="true">
	<defs>
		<filter id={filterId}>
			<feTurbulence type="turbulence" {baseFrequency} numOctaves="3" {seed} result="turbulence" />
			<feDisplacementMap
				in="SourceGraphic"
				in2="turbulence"
				scale={scaleValue}
				xChannelSelector="R"
				yChannelSelector="G"
			/>
		</filter>
	</defs>
</svg>

<div
	bind:this={element}
	data-displacement
	class={className}
	data-turbulence={turbulence}
	data-animated={shouldAnimate || undefined}
	data-reduced-motion={prefersReducedMotion || undefined}
	{...rest}
>
	{#if childSnippet}
		{@render childSnippet()}
	{/if}
</div>

<style>
	[data-displacement-svg] {
		position: absolute;
		pointer-events: none;
	}

	[data-displacement] {
		position: relative;
		border-radius: inherit;
		overflow: hidden;
	}
</style>
