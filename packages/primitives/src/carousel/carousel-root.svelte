<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
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

	const canScrollPrev = $derived(loop || activeIndex > 0);
	const canScrollNext = $derived(loop || activeIndex < totalSlides - 1);

	function resolveIndex(index: number) {
		if (totalSlides === 0) {
			return 0;
		}

		let target = index;
		if (loop) {
			target = ((index % totalSlides) + totalSlides) % totalSlides;
		} else {
			target = Math.max(0, Math.min(index, totalSlides - 1));
		}

		return target;
	}

	function scrollViewportTo(index: number) {
		if (!viewportEl) {
			return;
		}

		const slide = viewportEl.children[index] as HTMLElement | undefined;
		if (!slide) {
			return;
		}

		viewportEl.scrollTo({
			left: orientation === 'horizontal' ? slide.offsetLeft : 0,
			top: orientation === 'vertical' ? slide.offsetTop : 0,
			behavior: 'smooth'
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
		scrollTo,
		syncActiveIndex,
		scrollPrev() {
			scrollTo(activeIndex - 1);
		},
		scrollNext() {
			scrollTo(activeIndex + 1);
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

	// Autoplay
	$effect(() => {
		if (!autoplay) return;
		const interval = setInterval(() => {
			scrollTo(activeIndex + 1);
		}, autoplay);
		return () => clearInterval(interval);
	});
</script>

<div
	role="region"
	aria-roledescription="carousel"
	data-orientation={orientation}
	class={className}
	{...rest}
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
	{@render children()}
</div>
