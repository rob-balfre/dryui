import { afterEach, describe, expect, it } from 'bun:test';
import {
	getReducedMotionPreference as getPrimitiveReducedMotionPreference,
	observeReducedMotionPreference,
	supportsIntersectionObservers,
	supportsPointerTracking
} from '../../../packages/primitives/src/internal/motion';
import {
	getReducedMotionPreference as getUiReducedMotionPreference,
	registerPropertyOnce,
	supportsPropertyRegistration,
	supportsScrollTimelines,
	supportsViewTransitions
} from '../../../packages/ui/src/internal/motion';

const originalWindow = globalThis.window;
const originalMatchMedia = originalWindow?.matchMedia;
const originalIntersectionObserver = globalThis.IntersectionObserver;
const originalPointerEvent = globalThis.PointerEvent;
const originalDocument = globalThis.document;
const originalStartViewTransition = (
	originalDocument as (Document & { startViewTransition?: unknown }) | undefined
)?.startViewTransition;
const originalCss = globalThis.CSS;

function ensureWindow(): Window & typeof globalThis {
	return ((globalThis as typeof globalThis & { window?: Window & typeof globalThis }).window ??=
		globalThis as Window & typeof globalThis);
}

afterEach(() => {
	const windowLike = (globalThis as typeof globalThis & { window?: Window & typeof globalThis })
		.window;

	if (originalMatchMedia) {
		ensureWindow().matchMedia = originalMatchMedia;
	} else if (windowLike) {
		delete windowLike.matchMedia;
	}

	if (originalIntersectionObserver) {
		globalThis.IntersectionObserver = originalIntersectionObserver;
	} else {
		delete (
			globalThis as typeof globalThis & { IntersectionObserver?: typeof IntersectionObserver }
		).IntersectionObserver;
	}

	if (originalPointerEvent) {
		globalThis.PointerEvent = originalPointerEvent;
	} else {
		delete (globalThis as typeof globalThis & { PointerEvent?: typeof PointerEvent }).PointerEvent;
	}

	if (originalStartViewTransition) {
		(globalThis.document as Document & { startViewTransition?: unknown }).startViewTransition =
			originalStartViewTransition;
	} else {
		delete (globalThis.document as (Document & { startViewTransition?: unknown }) | undefined)
			?.startViewTransition;
	}

	if (originalDocument) {
		globalThis.document = originalDocument;
	} else {
		delete (globalThis as typeof globalThis & { document?: Document }).document;
	}

	if (originalWindow) {
		(globalThis as typeof globalThis & { window?: Window & typeof globalThis }).window =
			originalWindow as Window & typeof globalThis;
	} else {
		delete (globalThis as typeof globalThis & { window?: Window & typeof globalThis }).window;
	}

	if (originalCss) {
		globalThis.CSS = originalCss;
	}
});

describe('motion support helpers', () => {
	it('reads reduced-motion preference from matchMedia', () => {
		ensureWindow().matchMedia = (() => ({
			matches: true,
			addEventListener() {},
			removeEventListener() {}
		})) as typeof window.matchMedia;

		expect(getPrimitiveReducedMotionPreference()).toBe(true);
		expect(getUiReducedMotionPreference()).toBe(true);
	});

	it('subscribes to reduced-motion changes immediately', () => {
		const listeners = new Set<() => void>();
		let matches = false;

		ensureWindow().matchMedia = (() => ({
			get matches() {
				return matches;
			},
			addEventListener(_type: string, listener: () => void) {
				listeners.add(listener);
			},
			removeEventListener(_type: string, listener: () => void) {
				listeners.delete(listener);
			}
		})) as typeof window.matchMedia;

		const observed: boolean[] = [];
		const stop = observeReducedMotionPreference((value) => {
			observed.push(value);
		});

		matches = true;
		for (const listener of listeners) listener();

		stop();

		expect(observed).toEqual([false, true]);
	});

	it('detects available browser motion features', () => {
		ensureWindow();
		globalThis.IntersectionObserver = class {} as typeof IntersectionObserver;
		globalThis.PointerEvent = class extends Event {} as typeof PointerEvent;
		(
			((globalThis as typeof globalThis & { document?: Document }).document ??=
				{} as Document) as Document & { startViewTransition?: () => void }
		).startViewTransition = () => {};
		globalThis.CSS = {
			supports(query: string) {
				return query === 'animation-timeline: view()';
			},
			registerProperty() {}
		} as typeof CSS;

		expect(supportsIntersectionObservers()).toBe(true);
		expect(supportsPointerTracking()).toBe(true);
		expect(supportsViewTransitions()).toBe(true);
		expect(supportsScrollTimelines()).toBe(true);
		expect(supportsPropertyRegistration()).toBe(true);
	});

	it('registers typed custom properties only once', () => {
		let calls = 0;
		globalThis.CSS = {
			supports() {
				return true;
			},
			registerProperty() {
				calls += 1;
			}
		} as typeof CSS;

		expect(
			registerPropertyOnce({
				name: '--dry-test-angle',
				syntax: '<angle>',
				inherits: false,
				initialValue: '0deg'
			})
		).toBe(true);

		expect(
			registerPropertyOnce({
				name: '--dry-test-angle',
				syntax: '<angle>',
				inherits: false,
				initialValue: '0deg'
			})
		).toBe(false);

		expect(calls).toBe(1);
	});
});
