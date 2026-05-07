<script module lang="ts">
	let carouselIds = 0;
</script>

<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
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
	// Lock observer-driven activeIndex updates to a single physical target while a
	// programmatic smooth scroll is animating, so intermediate slides crossing the
	// IntersectionObserver threshold do not retarget the active dot.
	let programmaticTarget: number | null = null;
	let programmaticTimeoutId: ReturnType<typeof setTimeout> | null = null;
	const carouselId = `dry-carousel-${++carouselIds}`;

	// When loop is on and there are at least two real slides, we render a clone of
	// the last slide before the first and a clone of the first slide after the
	// last. cloneOffset is the number of leading clones (0 or 1).
	const cloneOffset = $derived(loop && totalSlides >= 2 ? 1 : 0);
	const loopActive = $derived(cloneOffset === 1);

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

	function logicalToPhysical(logical: number): number {
		return logical + cloneOffset;
	}

	function physicalToLogical(physical: number): number {
		if (!loopActive) return physical;
		if (physical === 0) return totalSlides - 1; // clone-of-last
		if (physical === totalSlides + 1) return 0; // clone-of-first
		return physical - 1;
	}

	function clearProgrammaticTarget() {
		programmaticTarget = null;
		if (programmaticTimeoutId !== null) {
			clearTimeout(programmaticTimeoutId);
			programmaticTimeoutId = null;
		}
	}

	function scrollViewportToPhysical(physical: number) {
		if (!viewportEl) return;
		const slide = viewportEl.children[physical] as HTMLElement | undefined;
		if (!slide) return;
		programmaticTarget = physical;
		if (programmaticTimeoutId !== null) clearTimeout(programmaticTimeoutId);
		programmaticTimeoutId = setTimeout(clearProgrammaticTarget, 1000);
		viewportEl.scrollTo({
			left: orientation === 'horizontal' ? slide.offsetLeft : 0,
			top: orientation === 'vertical' ? slide.offsetTop : 0,
			behavior: prefersReducedMotion ? 'auto' : 'smooth'
		});
	}

	function syncActiveIndex(physicalIndex: number) {
		if (programmaticTarget !== null && physicalIndex !== programmaticTarget) return;
		activeIndex = physicalToLogical(physicalIndex);
		if (physicalIndex === programmaticTarget) clearProgrammaticTarget();
	}

	function scrollTo(logicalIndex: number) {
		realignFromCloneZone();
		const target = resolveIndex(logicalIndex);
		activeIndex = target;
		scrollViewportToPhysical(logicalToPhysical(target));
	}

	function scrollNext() {
		realignFromCloneZone();
		if (loopActive && activeIndex === totalSlides - 1) {
			// Forward wrap: smooth-scroll past the real last into the clone-of-first
			// (physical index totalSlides + 1). The scrollend handler then instant-
			// snaps back to the real first (physical index cloneOffset).
			activeIndex = 0;
			scrollViewportToPhysical(totalSlides + 1);
			return;
		}
		scrollTo(activeIndex + 1);
	}

	function scrollPrev() {
		realignFromCloneZone();
		if (loopActive && activeIndex === 0) {
			// Backward wrap: scroll into clone-of-last (physical index 0). The
			// scrollend handler snaps back to the real last (physical totalSlides).
			activeIndex = totalSlides - 1;
			scrollViewportToPhysical(0);
			return;
		}
		scrollTo(activeIndex - 1);
	}

	function snapBackFromClone() {
		if (!loopActive || !viewportEl) return;
		const cloneOfLastEl = viewportEl.children[0] as HTMLElement | undefined;
		const realLastEl = viewportEl.children[totalSlides] as HTMLElement | undefined;
		const realFirstEl = viewportEl.children[1] as HTMLElement | undefined;
		const cloneOfFirstEl = viewportEl.children[totalSlides + 1] as HTMLElement | undefined;
		if (!cloneOfLastEl || !realLastEl || !realFirstEl || !cloneOfFirstEl) return;

		const epsilon = 4;
		const scrollPos = orientation === 'horizontal' ? viewportEl.scrollLeft : viewportEl.scrollTop;

		if (Math.abs(scrollPos - offsetOf(cloneOfLastEl)) < epsilon) {
			scrollInstant(realLastEl);
		} else if (Math.abs(scrollPos - offsetOf(cloneOfFirstEl)) < epsilon) {
			scrollInstant(realFirstEl);
		}
	}

	// Called before any new programmatic navigation. If a previous wrap animation
	// is still in flight (scroll position is anywhere past the real last or before
	// the real first slide), instant-snap to the real twin first. The clone is a
	// pixel-identical copy of the twin, so the snap is visually invisible — but
	// it puts the next smooth scroll's start position on a real slide, preventing
	// the long backward rewind that rapid clicks would otherwise produce.
	function realignFromCloneZone() {
		if (!loopActive || !viewportEl) return;
		const realLastEl = viewportEl.children[totalSlides] as HTMLElement | undefined;
		const realFirstEl = viewportEl.children[1] as HTMLElement | undefined;
		if (!realLastEl || !realFirstEl) return;

		const scrollPos = orientation === 'horizontal' ? viewportEl.scrollLeft : viewportEl.scrollTop;
		const realFirstPos = offsetOf(realFirstEl);
		const realLastPos = offsetOf(realLastEl);
		const epsilon = 1;

		if (scrollPos > realLastPos + epsilon) {
			scrollInstant(realFirstEl);
			clearProgrammaticTarget();
		} else if (scrollPos < realFirstPos - epsilon) {
			scrollInstant(realLastEl);
			clearProgrammaticTarget();
		}
	}

	function offsetOf(el: HTMLElement): number {
		return orientation === 'horizontal' ? el.offsetLeft : el.offsetTop;
	}

	function scrollInstant(el: HTMLElement) {
		if (!viewportEl) return;
		viewportEl.scrollTo({
			left: orientation === 'horizontal' ? el.offsetLeft : 0,
			top: orientation === 'vertical' ? el.offsetTop : 0,
			behavior: 'instant'
		});
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
		scrollPrev,
		scrollNext,
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
			scrollNext();
		}, autoplayDelay);
		return () => clearInterval(interval);
	});

	// Insert/remove edge clones whenever loop or totalSlides changes. The clones
	// are static DOM copies (no Svelte reactivity) — anything stateful inside a
	// slide will not stay in sync with the original. This is a known limitation
	// of slide-cloning carousels and is documented in carousel.meta.ts.
	$effect(() => {
		const view = viewportEl;
		if (!view) return;
		// Track totalSlides for reactivity even when loopActive short-circuits.
		const slideCount = totalSlides;
		if (!loopActive || slideCount < 2) return;

		const realChildren = Array.from(view.children).filter(
			(child) => !(child as HTMLElement).hasAttribute('data-carousel-clone')
		) as HTMLElement[];
		if (realChildren.length !== slideCount) return;

		const realFirst = realChildren[0];
		const realLast = realChildren[realChildren.length - 1];
		if (!realFirst || !realLast) return;

		const cloneOfLast = realLast.cloneNode(true) as HTMLElement;
		const cloneOfFirst = realFirst.cloneNode(true) as HTMLElement;

		for (const clone of [cloneOfLast, cloneOfFirst]) {
			clone.setAttribute('data-carousel-clone', '');
			clone.setAttribute('aria-hidden', 'true');
			clone.setAttribute('inert', '');
			clone.removeAttribute('id');
			clone.removeAttribute('data-active');
			for (const desc of clone.querySelectorAll('[id]')) desc.removeAttribute('id');
		}

		view.insertBefore(cloneOfLast, realFirst);
		view.appendChild(cloneOfFirst);

		// Position the viewport on the active real slide. Read activeIndex via
		// untrack so a programmatic scrollTo (which updates activeIndex) does not
		// re-trigger this effect and clobber the in-flight smooth scroll with an
		// instant one.
		const currentLogical = untrack(() => activeIndex);
		const initialSlide = view.children[currentLogical + 1] as HTMLElement | undefined;
		if (initialSlide) {
			view.scrollTo({
				left: orientation === 'horizontal' ? initialSlide.offsetLeft : 0,
				top: orientation === 'vertical' ? initialSlide.offsetTop : 0,
				behavior: 'instant'
			});
		}

		return () => {
			cloneOfLast.remove();
			cloneOfFirst.remove();
		};
	});

	// scrollend fires when a smooth-scroll animation finishes (or when a user
	// drag/touch settles). We use it to release the programmatic lock and to
	// snap-back from a clone to its real twin so the carousel never gets stuck
	// at a clone position.
	$effect(() => {
		const view = viewportEl;
		if (!view) return;
		const handle = () => {
			snapBackFromClone();
			clearProgrammaticTarget();
		};
		view.addEventListener('scrollend', handle);
		return () => view.removeEventListener('scrollend', handle);
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
			scrollPrev();
		}
		if (e.key === next) {
			e.preventDefault();
			scrollNext();
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
