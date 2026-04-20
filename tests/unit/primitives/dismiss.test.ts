import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import { Window } from 'happy-dom';
import {
	createDismiss,
	isInsideDismissRegion
} from '../../../packages/primitives/src/utils/dismiss.svelte.ts';

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
const originalNode = globalThis.Node;
const originalElement = globalThis.Element;
const originalHTMLElement = globalThis.HTMLElement;
const originalEffect = (globalThis as typeof globalThis & { $effect?: unknown }).$effect;

type Cleanup = () => void;

let windowRef: InstanceType<typeof Window>;
let effectCleanups: Cleanup[];

beforeEach(() => {
	windowRef = new Window();
	(windowRef as typeof windowRef & { SyntaxError?: typeof SyntaxError }).SyntaxError = SyntaxError;
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

	effectCleanups = [];
	(
		globalThis as typeof globalThis & {
			$effect?: (callback: () => void | Cleanup) => void;
		}
	).$effect = (callback) => {
		const cleanup = callback();
		if (typeof cleanup === 'function') {
			effectCleanups.push(cleanup);
		}
	};
});

afterEach(() => {
	for (const cleanup of effectCleanups.splice(0)) {
		cleanup();
	}

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

	if (originalEffect) {
		(globalThis as typeof globalThis & { $effect?: unknown }).$effect = originalEffect;
	} else {
		delete (globalThis as typeof globalThis & { $effect?: unknown }).$effect;
	}
});

describe('dismiss utilities', () => {
	test('treats targets inside data-dismiss-ignore ancestors as internal', () => {
		const ignoredAncestor = document.createElement('div');
		ignoredAncestor.setAttribute('data-dismiss-ignore', '');

		const nestedTarget = document.createElement('span');
		ignoredAncestor.appendChild(nestedTarget);
		document.body.appendChild(ignoredAncestor);

		expect(isInsideDismissRegion(nestedTarget, {})).toBe(true);
	});

	test('registers escape and outside-click handlers, then removes them on effect cleanup', () => {
		const added: Array<{
			type: string;
			listener: EventListenerOrEventListenerObject;
			options: boolean | AddEventListenerOptions | undefined;
		}> = [];
		const removed: Array<{
			type: string;
			listener: EventListenerOrEventListenerObject;
			options: boolean | EventListenerOptions | undefined;
		}> = [];
		const nativeAddEventListener = document.addEventListener.bind(document);
		const nativeRemoveEventListener = document.removeEventListener.bind(document);

		document.addEventListener = ((type, listener, options) => {
			added.push({ type, listener, options });
			return nativeAddEventListener(type, listener, options);
		}) as typeof document.addEventListener;
		document.removeEventListener = ((type, listener, options) => {
			removed.push({ type, listener, options });
			return nativeRemoveEventListener(type, listener, options);
		}) as typeof document.removeEventListener;

		const contentEl = document.createElement('div');
		const contentChild = document.createElement('span');
		contentEl.appendChild(contentChild);

		const triggerEl = document.createElement('button');
		const triggerChild = document.createElement('span');
		triggerEl.appendChild(triggerChild);

		const outside = document.createElement('div');
		const focusTarget = document.createElement('button');
		focusTarget.focus = mock(() => {});
		document.body.append(contentEl, triggerEl, outside, focusTarget);

		const onDismiss = mock(() => {});

		createDismiss({
			onDismiss,
			contentEl: () => contentEl,
			triggerEl: () => triggerEl,
			preventDefaultOnEscape: true,
			returnFocusTo: () => focusTarget
		});

		expect(
			added.map(({ type, options }) => ({
				type,
				options
			}))
		).toEqual([
			{ type: 'keydown', options: true },
			{ type: 'pointerdown', options: undefined }
		]);

		const keydownListener = added.find(({ type }) => type === 'keydown')?.listener as EventListener;
		const pointerdownListener = added.find(({ type }) => type === 'pointerdown')
			?.listener as EventListener;

		keydownListener(
			new windowRef.KeyboardEvent('keydown', {
				key: 'Enter',
				bubbles: true,
				cancelable: true
			})
		);
		expect(onDismiss).not.toHaveBeenCalled();

		const escapeEvent = new windowRef.KeyboardEvent('keydown', {
			key: 'Escape',
			bubbles: true,
			cancelable: true
		});
		keydownListener(escapeEvent);

		expect(onDismiss).toHaveBeenCalledTimes(1);
		expect(escapeEvent.defaultPrevented).toBe(true);
		expect(focusTarget.focus).toHaveBeenCalledTimes(1);

		pointerdownListener({ target: contentChild } as PointerEvent);
		pointerdownListener({ target: triggerChild } as PointerEvent);
		expect(onDismiss).toHaveBeenCalledTimes(1);

		pointerdownListener({ target: outside } as PointerEvent);
		expect(onDismiss).toHaveBeenCalledTimes(2);

		for (const cleanup of effectCleanups.splice(0)) {
			cleanup();
		}

		expect(
			removed.map(({ type, options }) => ({
				type,
				options
			}))
		).toEqual([
			{ type: 'keydown', options: true },
			{ type: 'pointerdown', options: undefined }
		]);

		document.dispatchEvent(
			new windowRef.KeyboardEvent('keydown', {
				key: 'Escape',
				bubbles: true,
				cancelable: true
			})
		);
		outside.dispatchEvent(new windowRef.Event('pointerdown', { bubbles: true }));

		expect(onDismiss).toHaveBeenCalledTimes(2);
	});

	test('does not attach listeners while disabled', () => {
		const addEventListener = mock(document.addEventListener.bind(document));
		document.addEventListener = addEventListener as unknown as typeof document.addEventListener;

		createDismiss({
			onDismiss: mock(() => {}),
			enabled: () => false
		});

		expect(addEventListener).not.toHaveBeenCalled();
		expect(effectCleanups).toHaveLength(0);
	});
});
