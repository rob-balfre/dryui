<script module lang="ts">
	let carouselIds = 0;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import {
		getReducedMotionPreference,
		observeReducedMotionPreference
	} from '../internal/motion.js';
	import { setCarouselCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		orientation?: 'horizontal' | 'vertical';
		loop?: boolean;
		autoplay?: number | false;
		children: Snippet;
	}

	let {
		orientation = 'horizontal',
		loop = false,
		autoplay = false,
		class: className,
		children,
		...rest
	}: Props = $props();

	let activeIndex = $state(0);
	let totalSlides = $state(0);
	let slideCounter = $state(0);
	let viewportEl = $state<HTMLElement | null>(null);
	let rootEl = $state<HTMLDivElement | null>(null);
	let prefersReducedMotion = $state(false);
	let manualPaused = $state(false);
	let pausedByHover = $state(false);
	let pausedByFocus = $state(false);
	const carouselId = `dry-carousel-${++carouselIds}`;

	const canScrollPrev = $derived(loop || activeIndex > 0);
	const canScrollNext = $derived(loop || activeIndex < totalSlides - 1);
	const autoplayDelay = $derived(typeof autoplay === 'number' && autoplay > 0 ? autoplay : 0);
	const autoplayConfigured = $derived(autoplayDelay > 0);
	const autoplayEnabled = $derived(autoplayConfigured && totalSlides > 1);
	const autoplayPaused = $derived(manualPaused || pausedByHover || pausedByFocus);
	const autoplayRunning = $derived(autoplayEnabled && !autoplayPaused);

	function resolveIndex(index: number) {
		if (totalSlides === 0) return 0;
		if (loop) return ((index % totalSlides) + totalSlides) % totalSlides;
		return Math.max(0, Math.min(index, totalSlides - 1));
	}

	function scrollViewportTo(index: number) {
		if (!viewportEl) return;
		const slide = viewportEl.children[index] as HTMLElement | undefined;
		if (!slide) return;
		viewportEl.scrollTo({
			left: orientation === 'horizontal' ? slide.offsetLeft : 0,
			top: orientation === 'vertical' ? slide.offsetTop : 0,
			behavior: prefersReducedMotion ? 'auto' : 'smooth'
		});
	}

	function syncActiveIndex(index: number) {
		activeIndex = resolveIndex(index);
	}

	function scrollTo(index: number) {
		const target = resolveIndex(index);
		activeIndex = target;
		scrollViewportTo(target);
	}

	function toggleAutoplay() {
		if (!autoplayEnabled) return;

		if (autoplayRunning) {
			manualPaused = true;
			return;
		}

		manualPaused = false;
		pausedByHover = false;
		pausedByFocus = false;
	}

	setCarouselCtx({
		get activeIndex() {
			return activeIndex;
		},
		get totalSlides() {
			return totalSlides;
		},
		get orientation() {
			return orientation;
		},
		get canScrollPrev() {
			return canScrollPrev;
		},
		get canScrollNext() {
			return canScrollNext;
		},
		get autoplayEnabled() {
			return autoplayEnabled;
		},
		get autoplayPaused() {
			return autoplayPaused;
		},
		get autoplayRunning() {
			return autoplayRunning;
		},
		scrollTo,
		syncActiveIndex,
		scrollPrev() {
			scrollTo(activeIndex - 1);
		},
		scrollNext() {
			scrollTo(activeIndex + 1);
		},
		toggleAutoplay,
		getSlideId(index) {
			return `${carouselId}-slide-${index + 1}`;
		},
		registerViewport(el) {
			viewportEl = el;
		},
		registerSlide() {
			const idx = slideCounter;
			slideCounter++;
			totalSlides = slideCounter;
			return idx;
		},
		unregisterSlide() {
			slideCounter--;
			totalSlides = slideCounter;
			if (activeIndex >= totalSlides && totalSlides > 0) {
				activeIndex = totalSlides - 1;
			}
		}
	});

	$effect(() => {
		if (!autoplayConfigured) {
			prefersReducedMotion = false;
			manualPaused = false;
			pausedByHover = false;
			pausedByFocus = false;
			return;
		}

		prefersReducedMotion = getReducedMotionPreference();
		if (prefersReducedMotion) {
			manualPaused = true;
		}

		return observeReducedMotionPreference((value) => {
			prefersReducedMotion = value;
			if (value) {
				manualPaused = true;
			}
		});
	});

	$effect(() => {
		if (!autoplayRunning || !autoplayConfigured) return;
		const interval = setInterval(() => {
			scrollTo(activeIndex + 1);
		}, autoplayDelay);
		return () => clearInterval(interval);
	});
</script>

<div
	bind:this={rootEl}
	role="group"
	aria-roledescription="carousel"
	data-carousel-root
	data-orientation={orientation}
	data-autoplay-enabled={autoplayEnabled ? '' : undefined}
	data-autoplay-state={autoplayEnabled ? (autoplayRunning ? 'running' : 'paused') : undefined}
	class={className}
	{...rest}
	onfocusin={() => {
		if (autoplayEnabled) {
			pausedByFocus = true;
		}
	}}
	onfocusout={(event) => {
		const nextTarget = event.relatedTarget;
		if (rootEl && nextTarget instanceof Node && rootEl.contains(nextTarget)) {
			return;
		}

		pausedByFocus = false;
	}}
	onpointerenter={() => {
		if (autoplayEnabled) {
			pausedByHover = true;
		}
	}}
	onpointerleave={() => {
		pausedByHover = false;
	}}
	onkeydown={(e) => {
		const prev = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
		const next = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
		if (e.key === prev) {
			e.preventDefault();
			scrollTo(activeIndex - 1);
		}
		if (e.key === next) {
			e.preventDefault();
			scrollTo(activeIndex + 1);
		}
	}}
>
	{#if autoplayConfigured}
		<Button
			variant="outline"
			size="sm"
			type="button"
			data-carousel-rotation-control
			onclick={() => toggleAutoplay()}
		>
			{autoplayRunning ? 'Stop slide rotation' : 'Start slide rotation'}
		</Button>
	{/if}

	{@render children()}
</div>

<style>
	[data-carousel-root] {
		--dry-carousel-gap: var(--dry-space-4);

		position: relative;
	}

	[data-carousel-rotation-control] {
		position: absolute;
		top: var(--dry-space-3);
		left: var(--dry-space-3);
		z-index: 1;
	}
</style>
