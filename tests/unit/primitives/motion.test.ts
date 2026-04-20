import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import { Window } from 'happy-dom';
import {
	getReducedMotionPreference,
	observeInViewport,
	observeOffscreenState,
	observePageVisibility,
	observeReducedMotionPreference,
	registerPropertyOnce,
	supportsIntersectionObservers,
	supportsPointerTracking,
	supportsPropertyRegistration,
	supportsWebGL2
} from '../../../packages/primitives/src/internal/motion';

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
const originalNode = globalThis.Node;
const originalElement = globalThis.Element;
const originalHTMLElement = globalThis.HTMLElement;
const originalIntersectionObserver = globalThis.IntersectionObserver;
const originalPointerEvent = globalThis.PointerEvent;
const originalCss = globalThis.CSS;

let windowRef: InstanceType<typeof Window>;
let propertyCounter = 0;

function nextPropertyName(label: string) {
	propertyCounter += 1;
	return `--dryui-${label}-${propertyCounter}`;
}

beforeEach(() => {
	windowRef = new Window();
	(globalThis as typeof globalThis & { window?: Window & typeof globalThis }).window =
		windowRef as unknown as Window & typeof globalThis;
	(globalThis as typeof globalThis & { document?: Document }).document =
		windowRef.document as unknown as Document;
	(globalThis as typeof globalThis & { Node?: typeof Node }).Node =
		windowRef.Node as unknown as typeof Node;
	(globalThis as typeof globalThis & { Element?: typeof Element }).Element =
		windowRef.Element as unknown as typeof Element;
	(globalThis as typeof globalThis & { HTMLElement?: typeof HTMLElement }).HTMLElement =
		windowRef.HTMLElement as unknown as typeof HTMLElement;
});

afterEach(() => {
	if (originalWindow) {
		(globalThis as typeof globalThis & { window?: Window & typeof globalThis }).window =
			originalWindow as Window & typeof globalThis;
	} else {
		delete (globalThis as typeof globalThis & { window?: Window & typeof globalThis }).window;
	}

	if (originalDocument) {
		(globalThis as typeof globalThis & { document?: Document }).document = originalDocument;
	} else {
		delete (globalThis as typeof globalThis & { document?: Document }).document;
	}

	if (originalNode) {
		(globalThis as typeof globalThis & { Node?: typeof Node }).Node = originalNode;
	} else {
		delete (globalThis as typeof globalThis & { Node?: typeof Node }).Node;
	}

	if (originalElement) {
		(globalThis as typeof globalThis & { Element?: typeof Element }).Element = originalElement;
	} else {
		delete (globalThis as typeof globalThis & { Element?: typeof Element }).Element;
	}

	if (originalHTMLElement) {
		(globalThis as typeof globalThis & { HTMLElement?: typeof HTMLElement }).HTMLElement =
			originalHTMLElement;
	} else {
		delete (globalThis as typeof globalThis & { HTMLElement?: typeof HTMLElement }).HTMLElement;
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

	if (originalCss) {
		globalThis.CSS = originalCss;
	} else {
		delete (globalThis as typeof globalThis & { CSS?: typeof CSS }).CSS;
	}
});

describe('primitive motion utilities', () => {
	test('returns false when reduced-motion detection is unavailable', () => {
		delete windowRef.matchMedia;

		expect(getReducedMotionPreference()).toBe(false);
	});

	test('uses legacy media-query listeners when addEventListener is unavailable', () => {
		let matches = false;
		const listeners = new Set<() => void>();

		windowRef.matchMedia = (() => ({
			get matches() {
				return matches;
			},
			addListener(listener: () => void) {
				listeners.add(listener);
			},
			removeListener(listener: () => void) {
				listeners.delete(listener);
			}
		})) as typeof window.matchMedia;

		const observed: boolean[] = [];
		const stop = observeReducedMotionPreference((value) => {
			observed.push(value);
		});

		matches = true;
		for (const listener of listeners) {
			listener();
		}

		stop();

		expect(observed).toEqual([false, true]);
		expect(listeners.size).toBe(0);
	});

	test('falls back to treating elements as in-view when IntersectionObserver is missing', () => {
		const target = document.createElement('div');
		const observed: boolean[] = [];

		expect(supportsIntersectionObservers()).toBe(false);

		const stop = observeInViewport(target, (value) => {
			observed.push(value);
		});

		stop();

		expect(observed).toEqual([true]);
	});

	test('relays viewport changes and disconnects observers on cleanup', () => {
		let callback: IntersectionObserverCallback | undefined;

		class FakeIntersectionObserver {
			readonly observe = mock((_target: Element) => {});
			readonly disconnect = mock(() => {});

			constructor(
				cb: IntersectionObserverCallback,
				public readonly options: IntersectionObserverInit
			) {
				callback = cb;
			}
		}

		globalThis.IntersectionObserver =
			FakeIntersectionObserver as unknown as typeof IntersectionObserver;

		const target = document.createElement('div');
		const observed: boolean[] = [];
		const stop = observeInViewport(
			target,
			(value) => {
				observed.push(value);
			},
			{ rootMargin: '12px', threshold: 0.25 }
		);

		const instance = (
			globalThis as typeof globalThis & {
				IntersectionObserver: typeof FakeIntersectionObserver;
			}
		).IntersectionObserver as unknown as typeof FakeIntersectionObserver;

		expect(supportsIntersectionObservers()).toBe(true);
		expect(callback).toBeDefined();

		callback?.(
			[
				{ isIntersecting: false } as IntersectionObserverEntry,
				{ isIntersecting: true } as IntersectionObserverEntry
			],
			instance.prototype as unknown as IntersectionObserver
		);

		stop();

		expect(observed).toEqual([false, true]);
	});

	test('tracks page visibility changes and removes the listener on cleanup', () => {
		let visibility: DocumentVisibilityState = 'visible';
		Object.defineProperty(document, 'visibilityState', {
			get: () => visibility,
			configurable: true
		});

		const observed: boolean[] = [];
		const stop = observePageVisibility((value) => {
			observed.push(value);
		});

		visibility = 'hidden';
		document.dispatchEvent(new windowRef.Event('visibilitychange'));

		stop();

		visibility = 'visible';
		document.dispatchEvent(new windowRef.Event('visibilitychange'));

		expect(observed).toEqual([true, false]);
	});

	test('toggles the offscreen attribute from viewport and tab visibility changes', () => {
		let visibility: DocumentVisibilityState = 'visible';
		let callback: IntersectionObserverCallback | undefined;
		const disconnect = mock(() => {});

		Object.defineProperty(document, 'visibilityState', {
			get: () => visibility,
			configurable: true
		});

		class FakeIntersectionObserver {
			readonly observe = mock((_target: Element) => {});
			readonly disconnect = disconnect;

			constructor(cb: IntersectionObserverCallback) {
				callback = cb;
			}
		}

		globalThis.IntersectionObserver =
			FakeIntersectionObserver as unknown as typeof IntersectionObserver;

		const target = document.createElement('div');
		const stop = observeOffscreenState(target);

		expect(target.hasAttribute('data-offscreen')).toBe(false);

		callback?.(
			[{ isIntersecting: false } as IntersectionObserverEntry],
			{} as IntersectionObserver
		);
		expect(target.hasAttribute('data-offscreen')).toBe(true);

		callback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
		expect(target.hasAttribute('data-offscreen')).toBe(false);

		visibility = 'hidden';
		document.dispatchEvent(new windowRef.Event('visibilitychange'));
		expect(target.hasAttribute('data-offscreen')).toBe(true);

		visibility = 'visible';
		document.dispatchEvent(new windowRef.Event('visibilitychange'));
		expect(target.hasAttribute('data-offscreen')).toBe(false);

		stop();

		expect(disconnect).toHaveBeenCalledTimes(1);
	});

	test('retries property registration after a thrown error and then deduplicates successful names', () => {
		const name = nextPropertyName('angle');
		let registerCalls = 0;

		globalThis.CSS = {
			registerProperty() {
				registerCalls += 1;
				throw new Error('unsupported');
			}
		} as typeof CSS;

		expect(supportsPropertyRegistration()).toBe(true);
		expect(
			registerPropertyOnce({
				name,
				syntax: '<angle>',
				inherits: false,
				initialValue: '0deg'
			})
		).toBe(false);

		globalThis.CSS = {
			registerProperty() {
				registerCalls += 1;
			}
		} as typeof CSS;

		expect(
			registerPropertyOnce({
				name,
				syntax: '<angle>',
				inherits: false,
				initialValue: '0deg'
			})
		).toBe(true);
		expect(
			registerPropertyOnce({
				name,
				syntax: '<angle>',
				inherits: false,
				initialValue: '0deg'
			})
		).toBe(false);
		expect(registerCalls).toBe(2);
	});

	test('detects pointer tracking and WebGL2 support via browser APIs', () => {
		globalThis.PointerEvent = class extends Event {} as typeof PointerEvent;

		const nativeCreateElement = document.createElement.bind(document);
		document.createElement = ((tagName: string) => {
			if (tagName !== 'canvas') {
				return nativeCreateElement(tagName);
			}

			return {
				getContext(contextId: string) {
					if (contextId !== 'webgl2') {
						return null;
					}

					return {};
				}
			} as unknown as HTMLCanvasElement;
		}) as typeof document.createElement;

		expect(supportsPointerTracking()).toBe(true);
		expect(supportsWebGL2()).toBe(true);

		document.createElement = ((tagName: string) => {
			if (tagName !== 'canvas') {
				return nativeCreateElement(tagName);
			}

			return {
				getContext() {
					throw new Error('webgl unavailable');
				}
			} as unknown as HTMLCanvasElement;
		}) as typeof document.createElement;

		expect(supportsWebGL2()).toBe(false);
	});
});
