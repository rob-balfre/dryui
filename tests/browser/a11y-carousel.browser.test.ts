import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import CarouselA11yHarness from './fixtures/carousel-a11y-harness.svelte';
import { render } from './_harness';

const originalMatchMedia = window.matchMedia;

let matchMediaMatches = false;
let matchMediaListeners: Array<() => void> = [];

beforeEach(() => {
	matchMediaMatches = false;
	matchMediaListeners = [];
	window.matchMedia = (() => ({
		get matches() {
			return matchMediaMatches;
		},
		addEventListener(_event: string, handler: () => void) {
			matchMediaListeners.push(handler);
		},
		removeEventListener(_event: string, handler: () => void) {
			matchMediaListeners = matchMediaListeners.filter((listener) => listener !== handler);
		}
	})) as typeof window.matchMedia;
});

afterEach(() => {
	window.matchMedia = originalMatchMedia;
	vi.useRealTimers();
});

function setReducedMotion(value: boolean) {
	matchMediaMatches = value;

	for (const listener of matchMediaListeners) {
		listener();
	}
}

function renderCarousel(
	props: { autoplay?: number | false; controlPattern?: 'dots' | 'thumbnails' } = {}
) {
	return render(CarouselA11yHarness, props).target;
}

function getSlides() {
	return Array.from(document.querySelectorAll<HTMLElement>('[data-carousel-slide]')).filter(
		(slide) => !slide.hasAttribute('data-carousel-clone')
	);
}

function getActiveSlideIndex() {
	return getSlides().findIndex((slide) => slide.hasAttribute('data-active'));
}

function getRotationControl() {
	const button = document.querySelector<HTMLButtonElement>('[data-carousel-rotation-control]');

	if (!(button instanceof HTMLButtonElement)) {
		throw new Error('Expected autoplay rotation control button');
	}

	return button;
}

describe('carousel accessibility', () => {
	it('inserts clone slides for loop carousels and excludes them from the slide count', () => {
		renderCarousel({ controlPattern: 'dots' });

		const viewport = document.querySelector<HTMLElement>('[data-carousel-viewport]');
		const allChildren = Array.from(viewport?.children ?? []) as HTMLElement[];

		// 3 real slides + leading clone-of-last + trailing clone-of-first
		expect(allChildren).toHaveLength(5);
		expect(allChildren[0]?.hasAttribute('data-carousel-clone')).toBe(true);
		expect(allChildren[4]?.hasAttribute('data-carousel-clone')).toBe(true);
		expect(allChildren[1]?.hasAttribute('data-carousel-clone')).toBe(false);
		expect(allChildren[3]?.hasAttribute('data-carousel-clone')).toBe(false);

		// Clones should be hidden from assistive tech and inert.
		expect(allChildren[0]?.getAttribute('aria-hidden')).toBe('true');
		expect(allChildren[0]?.hasAttribute('inert')).toBe(true);
		expect(allChildren[4]?.getAttribute('aria-hidden')).toBe('true');
		expect(allChildren[4]?.hasAttribute('inert')).toBe(true);

		// IDs are stripped so cloned subtrees do not collide with their twins.
		expect(allChildren[0]?.id).toBe('');
		expect(allChildren[4]?.id).toBe('');

		// Real slide count stays 3.
		expect(getSlides()).toHaveLength(3);
	});

	it('wraps from the last slide to the first when scrolling next past the end', () => {
		renderCarousel({ controlPattern: 'dots' });

		const buttons = Array.from(
			document.querySelectorAll<HTMLButtonElement>('[data-carousel-dots] button')
		);

		buttons[2]?.click();
		flushSync();
		expect(getActiveSlideIndex()).toBe(2);

		const root = document.querySelector<HTMLElement>('[data-carousel-root]');
		root?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		flushSync();

		expect(getActiveSlideIndex()).toBe(0);
	});

	it('wraps from the first slide to the last when scrolling prev past the start', () => {
		renderCarousel({ controlPattern: 'dots' });

		expect(getActiveSlideIndex()).toBe(0);

		const root = document.querySelector<HTMLElement>('[data-carousel-root]');
		root?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
		flushSync();

		expect(getActiveSlideIndex()).toBe(2);
	});

	it('uses grouped buttons for dot pickers and keeps inactive slides inert', () => {
		renderCarousel({ controlPattern: 'dots' });

		const group = document.querySelector<HTMLElement>('[data-carousel-dots]');
		const buttons = Array.from(group?.querySelectorAll<HTMLButtonElement>('button') ?? []);
		const slides = getSlides();

		expect(group?.getAttribute('role')).toBe('group');
		expect(group?.getAttribute('aria-label')).toBe('Choose slide to display');
		expect(buttons).toHaveLength(3);

		for (const button of buttons) {
			expect(button.getAttribute('role')).toBeNull();
			expect(button.getAttribute('aria-selected')).toBeNull();
			expect(button.getAttribute('aria-pressed')).toBeNull();
		}

		expect(buttons[0]?.getAttribute('aria-disabled')).toBe('true');
		expect(buttons[1]?.hasAttribute('aria-disabled')).toBe(false);
		expect(buttons[0]?.getAttribute('aria-controls')).toBe(slides[0]?.id);

		expect(slides[0]?.getAttribute('role')).toBe('group');
		expect(slides[0]?.getAttribute('aria-roledescription')).toBe('slide');
		expect(slides[0]?.getAttribute('aria-label')).toBe('1 of 3');
		expect(slides[0]?.hasAttribute('aria-hidden')).toBe(false);
		expect(slides[0]?.hasAttribute('inert')).toBe(false);
		expect(slides[1]?.getAttribute('aria-hidden')).toBe('true');
		expect(slides[1]?.hasAttribute('inert')).toBe(true);

		buttons[1]?.click();
		flushSync();

		expect(buttons[1]?.getAttribute('aria-disabled')).toBe('true');
		expect(getActiveSlideIndex()).toBe(1);
		expect(slides[1]?.hasAttribute('inert')).toBe(false);
	});

	it('uses grouped buttons for thumbnail pickers without tab semantics', () => {
		renderCarousel({ controlPattern: 'thumbnails' });

		const group = document.querySelector<HTMLElement>('[data-carousel-thumbnails]');
		const buttons = Array.from(group?.querySelectorAll<HTMLButtonElement>('button') ?? []);

		expect(group?.getAttribute('role')).toBe('group');
		expect(group?.getAttribute('aria-label')).toBe('Choose slide to display');
		expect(buttons).toHaveLength(3);

		for (const button of buttons) {
			expect(button.getAttribute('role')).toBeNull();
			expect(button.getAttribute('aria-selected')).toBeNull();
			expect(button.getAttribute('aria-pressed')).toBeNull();
		}

		expect(buttons[0]?.getAttribute('aria-disabled')).toBe('true');

		buttons[2]?.click();
		flushSync();

		expect(buttons[2]?.getAttribute('aria-disabled')).toBe('true');
		expect(getActiveSlideIndex()).toBe(2);
	});

	it('pauses autoplay on reduced motion until the user explicitly starts it', () => {
		vi.useFakeTimers();
		matchMediaMatches = true;
		renderCarousel({ autoplay: 1000, controlPattern: 'dots' });

		const root = document.querySelector<HTMLElement>('[data-carousel-root]');
		const control = getRotationControl();

		expect(root?.getAttribute('data-autoplay-state')).toBe('paused');
		expect(control.textContent).toContain('Start slide rotation');
		expect(getActiveSlideIndex()).toBe(0);

		vi.advanceTimersByTime(1100);
		flushSync();
		expect(getActiveSlideIndex()).toBe(0);

		control.click();
		flushSync();
		expect(root?.getAttribute('data-autoplay-state')).toBe('running');

		vi.advanceTimersByTime(1100);
		flushSync();
		expect(getActiveSlideIndex()).toBe(1);
	});

	it('pauses autoplay on hover and focus, and resumes when interaction leaves', () => {
		vi.useFakeTimers();
		renderCarousel({ autoplay: 1000, controlPattern: 'dots' });

		const root = document.querySelector<HTMLElement>('[data-carousel-root]');

		if (!(root instanceof HTMLElement)) {
			throw new Error('Expected carousel root');
		}

		vi.advanceTimersByTime(1100);
		flushSync();
		expect(getActiveSlideIndex()).toBe(1);

		root.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
		flushSync();
		expect(root.getAttribute('data-autoplay-state')).toBe('paused');

		vi.advanceTimersByTime(1100);
		flushSync();
		expect(getActiveSlideIndex()).toBe(1);

		root.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
		flushSync();
		expect(root.getAttribute('data-autoplay-state')).toBe('running');

		vi.advanceTimersByTime(1100);
		flushSync();
		expect(getActiveSlideIndex()).toBe(2);

		root.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		flushSync();
		expect(root.getAttribute('data-autoplay-state')).toBe('paused');

		vi.advanceTimersByTime(1100);
		flushSync();
		expect(getActiveSlideIndex()).toBe(2);

		root.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }));
		flushSync();
		expect(root.getAttribute('data-autoplay-state')).toBe('running');

		vi.advanceTimersByTime(1100);
		flushSync();
		expect(getActiveSlideIndex()).toBe(0);
	});

	it('reacts to reduced-motion changes after mount by pausing rotation', () => {
		vi.useFakeTimers();
		renderCarousel({ autoplay: 1000, controlPattern: 'dots' });

		const root = document.querySelector<HTMLElement>('[data-carousel-root]');

		vi.advanceTimersByTime(1100);
		flushSync();
		expect(getActiveSlideIndex()).toBe(1);

		setReducedMotion(true);
		flushSync();
		expect(root?.getAttribute('data-autoplay-state')).toBe('paused');

		vi.advanceTimersByTime(1100);
		flushSync();
		expect(getActiveSlideIndex()).toBe(1);
	});
});
