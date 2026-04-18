<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { observeReducedMotionPreference } from '../internal/motion.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		speed?: number;
		direction?: 'left' | 'right' | 'up' | 'down';
		pauseOnHover?: boolean;
		fade?: boolean;
		gap?: string;
		children: Snippet;
	}

	let {
		speed = 50,
		direction = 'left',
		pauseOnHover = false,
		fade = false,
		gap = '1rem',
		children,
		...rest
	}: Props = $props();

	let contentEl: HTMLDivElement | undefined = $state();
	let contentSize = $state(0);
	let prefersReducedMotion = $state(false);

	const isVertical = $derived(direction === 'up' || direction === 'down');
	const duration = $derived(contentSize > 0 && speed > 0 ? contentSize / speed : 0);

	onMount(() =>
		observeReducedMotionPreference((matches) => {
			prefersReducedMotion = matches;
		})
	);

	$effect(() => {
		if (!contentEl) return;

		const el = contentEl;
		const measure = () => {
			contentSize = isVertical ? el.scrollHeight : el.scrollWidth;
		};

		measure();

		const observer = new ResizeObserver(measure);
		observer.observe(el);

		return () => observer.disconnect();
	});

	function applyRootStyles(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('--marquee-duration', `${duration}s`);
			node.style.setProperty('--marquee-gap', gap);
			node.style.setProperty('--marquee-shift', `${contentSize}px`);
		});
	}

	function applyTrackStyles(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('grid-auto-flow', isVertical ? 'row' : 'column');
		});
	}

	function applyContentStyles(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('grid-auto-flow', isVertical ? 'row' : 'column');
			node.style.setProperty('gap', 'var(--marquee-gap)');
			// Trailing padding on content (not gap on track) keeps the keyframe loop seamless.
			node.style.setProperty(
				isVertical ? 'padding-block-end' : 'padding-inline-end',
				'var(--marquee-gap)'
			);
			node.style.removeProperty(isVertical ? 'padding-inline-end' : 'padding-block-end');
		});
	}
</script>

<div
	data-marquee
	data-direction={direction}
	data-pause-on-hover={pauseOnHover || undefined}
	data-fade={fade || undefined}
	data-reduced-motion={prefersReducedMotion || undefined}
	use:applyRootStyles
	{...rest}
>
	<div data-marquee-track class="track" use:applyTrackStyles>
		<div data-marquee-content bind:this={contentEl} class="content" use:applyContentStyles>
			{@render children()}
		</div>
		<div data-marquee-content aria-hidden="true" class="content" use:applyContentStyles>
			{@render children()}
		</div>
	</div>
</div>

<style>
	.track {
		display: grid;
		grid-auto-columns: max-content;
		grid-auto-rows: max-content;
	}

	.content {
		display: grid;
		grid-auto-columns: max-content;
		grid-auto-rows: max-content;
	}
</style>
