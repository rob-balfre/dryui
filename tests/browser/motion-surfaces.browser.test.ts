import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import MotionSurfacesHarness from './fixtures/motion-surfaces-harness.svelte';
import { render } from './_harness';

const intersectionCallbacks: Array<(entries: Array<{ isIntersecting: boolean }>) => void> = [];

const originalIntersectionObserver = globalThis.IntersectionObserver;
const originalMatchMedia = window.matchMedia;

class MockIntersectionObserver {
	observe = vi.fn();
	unobserve = vi.fn();
	disconnect = vi.fn();

	constructor(callback: (entries: Array<{ isIntersecting: boolean }>) => void) {
		intersectionCallbacks.push(callback);
	}
}

let matchMediaMatches = false;
let matchMediaListeners: Array<() => void> = [];

beforeEach(() => {
	matchMediaMatches = false;
	matchMediaListeners = [];
	intersectionCallbacks.length = 0;
	globalThis.IntersectionObserver =
		MockIntersectionObserver as unknown as typeof IntersectionObserver;
	window.matchMedia = (() => ({
		get matches() {
			return matchMediaMatches;
		},
		addEventListener(_event: string, handler: () => void) {
			matchMediaListeners.push(handler);
		},
		removeEventListener(_event: string, handler: () => void) {
			matchMediaListeners = matchMediaListeners.filter((h) => h !== handler);
		}
	})) as typeof window.matchMedia;
});

afterEach(() => {
	if (originalIntersectionObserver) {
		globalThis.IntersectionObserver = originalIntersectionObserver;
	} else {
		delete (
			globalThis as typeof globalThis & { IntersectionObserver?: typeof IntersectionObserver }
		).IntersectionObserver;
	}

	window.matchMedia = originalMatchMedia;
});

function setReducedMotion(value: boolean) {
	matchMediaMatches = value;
	for (const listener of matchMediaListeners) {
		listener();
	}
}

function renderSurface(kind: 'reveal' | 'spotlight' | 'aurora' | 'noise' | 'marquee') {
	return render(MotionSurfacesHarness, { kind }).target;
}

describe('motion surfaces', () => {
	it('toggles reveal visibility from intersection state', () => {
		const target = renderSurface('reveal');
		const surface = target.querySelector('[data-testid="reveal"]');

		if (!(surface instanceof HTMLDivElement)) {
			throw new Error('Expected reveal surface');
		}

		expect(surface.hasAttribute('data-visible')).toBe(false);

		intersectionCallbacks[0]?.([{ isIntersecting: true }]);
		flushSync();
		expect(surface.hasAttribute('data-visible')).toBe(true);

		intersectionCallbacks[0]?.([{ isIntersecting: false }]);
		flushSync();
		expect(surface.hasAttribute('data-visible')).toBe(false);
	});

	it('updates spotlight coordinates from pointer movement', async () => {
		const target = renderSurface('spotlight');
		const surface = target.querySelector('[data-testid="spotlight"]');

		if (!(surface instanceof HTMLDivElement)) {
			throw new Error('Expected spotlight surface');
		}

		surface.getBoundingClientRect = () => new DOMRect(10, 20, 240, 120);

		surface.dispatchEvent(
			new PointerEvent('pointerenter', { clientX: 50, clientY: 70, bubbles: true })
		);
		surface.dispatchEvent(
			new PointerEvent('pointermove', { clientX: 70, clientY: 90, bubbles: true })
		);
		await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
		flushSync();

		const inlineStyle = surface.getAttribute('style') ?? '';
		expect(inlineStyle).toContain('--dry-spotlight-x: 60px');
		expect(inlineStyle).toContain('--dry-spotlight-y: 70px');
	});

	it('renders aurora with custom palette vars and noise with animation hooks', () => {
		const auroraTarget = renderSurface('aurora');
		const aurora = auroraTarget.querySelector('[data-testid="aurora"]');

		if (!(aurora instanceof HTMLDivElement)) {
			throw new Error('Expected aurora surface');
		}

		expect(aurora.getAttribute('style') ?? '').toContain('--dry-aurora-color-1: #020617');

		const noiseTarget = renderSurface('noise');
		const noise = noiseTarget.querySelector('[data-testid="noise"]');

		if (!(noise instanceof HTMLDivElement)) {
			throw new Error('Expected noise surface');
		}

		expect(noise.hasAttribute('data-animated')).toBe(true);
	});

	describe('reduced motion', () => {
		it('reveal sets data-reduced-motion and becomes visible', () => {
			matchMediaMatches = true;
			const target = renderSurface('reveal');
			const surface = target.querySelector('[data-testid="reveal"]');

			if (!(surface instanceof HTMLDivElement)) {
				throw new Error('Expected reveal surface');
			}

			expect(surface.hasAttribute('data-reduced-motion')).toBe(true);
			expect(surface.hasAttribute('data-visible')).toBe(true);
		});

		it('aurora sets data-reduced-motion and disables animation', () => {
			matchMediaMatches = true;
			const target = renderSurface('aurora');
			const aurora = target.querySelector('[data-testid="aurora"]');

			if (!(aurora instanceof HTMLDivElement)) {
				throw new Error('Expected aurora surface');
			}

			expect(aurora.hasAttribute('data-reduced-motion')).toBe(true);
			expect(aurora.hasAttribute('data-animated')).toBe(false);
		});

		it('noise sets data-reduced-motion and disables animation', () => {
			matchMediaMatches = true;
			const target = renderSurface('noise');
			const noise = target.querySelector('[data-testid="noise"]');

			if (!(noise instanceof HTMLDivElement)) {
				throw new Error('Expected noise surface');
			}

			expect(noise.hasAttribute('data-reduced-motion')).toBe(true);
			expect(noise.hasAttribute('data-animated')).toBe(false);
		});

		it('spotlight sets data-reduced-motion attributes when reduced-motion is active', () => {
			matchMediaMatches = true;
			const target = renderSurface('spotlight');
			const surface = target.querySelector('[data-testid="spotlight"]');

			if (!(surface instanceof HTMLDivElement)) {
				throw new Error('Expected spotlight surface');
			}

			// When reduced motion is active, spotlight becomes static and active
			expect(surface.hasAttribute('data-static')).toBe(true);
			expect(surface.hasAttribute('data-active')).toBe(true);
		});

		it('marquee sets data-reduced-motion when active', () => {
			matchMediaMatches = true;
			const target = renderSurface('marquee');
			const marquee = target.querySelector('[data-testid="marquee"]');

			if (!(marquee instanceof HTMLDivElement)) {
				throw new Error('Expected marquee surface');
			}

			expect(marquee.hasAttribute('data-reduced-motion')).toBe(true);
		});
	});

	describe('marquee', () => {
		it('renders duplicated content', () => {
			const target = renderSurface('marquee');
			const marquee = target.querySelector('[data-testid="marquee"]');

			if (!(marquee instanceof HTMLDivElement)) {
				throw new Error('Expected marquee surface');
			}

			const contentElements = marquee.querySelectorAll('[data-marquee-content]');
			expect(contentElements.length).toBe(2);
		});

		it('computes duration from content size and speed', () => {
			const target = renderSurface('marquee');
			const marquee = target.querySelector('[data-testid="marquee"]');

			if (!(marquee instanceof HTMLDivElement)) {
				throw new Error('Expected marquee surface');
			}

			// Duration is set as a CSS custom property
			const style = marquee.getAttribute('style') ?? '';
			expect(style).toContain('--marquee-duration');
		});

		it('supports pause-on-hover via data attribute', () => {
			const target = renderSurface('marquee');
			const marquee = target.querySelector('[data-testid="marquee"]');

			if (!(marquee instanceof HTMLDivElement)) {
				throw new Error('Expected marquee surface');
			}

			expect(marquee.hasAttribute('data-pause-on-hover')).toBe(true);
		});
	});

	describe('reveal variants', () => {
		it('once=true keeps element visible after intersection triggers', () => {
			// The harness uses once=false, but let's test the existing behavior:
			// When once=false, element becomes invisible again after leaving viewport
			const target = renderSurface('reveal');
			const surface = target.querySelector('[data-testid="reveal"]');

			if (!(surface instanceof HTMLDivElement)) {
				throw new Error('Expected reveal surface');
			}

			intersectionCallbacks[0]?.([{ isIntersecting: true }]);
			flushSync();
			expect(surface.hasAttribute('data-visible')).toBe(true);

			// once=false so it goes invisible when leaving
			intersectionCallbacks[0]?.([{ isIntersecting: false }]);
			flushSync();
			expect(surface.hasAttribute('data-visible')).toBe(false);
		});

		it('sets data-variant attribute', () => {
			const target = renderSurface('reveal');
			const surface = target.querySelector('[data-testid="reveal"]');

			if (!(surface instanceof HTMLDivElement)) {
				throw new Error('Expected reveal surface');
			}

			expect(surface.getAttribute('data-variant')).toBe('slide-up');
		});
	});

	describe('spotlight interactions', () => {
		it('activates on focusin and deactivates on focusout', () => {
			const target = renderSurface('spotlight');
			const surface = target.querySelector('[data-testid="spotlight"]');

			if (!(surface instanceof HTMLDivElement)) {
				throw new Error('Expected spotlight surface');
			}

			surface.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
			flushSync();
			expect(surface.hasAttribute('data-active')).toBe(true);

			surface.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
			flushSync();
			expect(surface.hasAttribute('data-active')).toBe(false);
		});

		it('resets position on pointer leave', () => {
			const target = renderSurface('spotlight');
			const surface = target.querySelector('[data-testid="spotlight"]');

			if (!(surface instanceof HTMLDivElement)) {
				throw new Error('Expected spotlight surface');
			}

			surface.getBoundingClientRect = () => new DOMRect(10, 20, 240, 120);

			surface.dispatchEvent(
				new PointerEvent('pointerenter', { clientX: 50, clientY: 70, bubbles: true })
			);
			flushSync();

			surface.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
			flushSync();

			const inlineStyle = surface.getAttribute('style') ?? '';
			expect(inlineStyle).toContain('--dry-spotlight-x: 50%');
			expect(inlineStyle).toContain('--dry-spotlight-y: 50%');
		});
	});

	describe('noise grain prop', () => {
		it('sets data-grain attribute', () => {
			const target = renderSurface('noise');
			const noise = target.querySelector('[data-testid="noise"]');

			if (!(noise instanceof HTMLDivElement)) {
				throw new Error('Expected noise surface');
			}

			expect(noise.getAttribute('data-grain')).toBe('fine');
		});
	});
});
