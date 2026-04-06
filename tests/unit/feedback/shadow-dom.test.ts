import { describe, test, expect } from 'bun:test';
import { GlobalWindow } from 'happy-dom';
import { isInShadowDOM, getShadowHost } from '../../../packages/feedback/src/utils/shadow-dom';

// Set up DOM globals for this test file
const happyWindow = new GlobalWindow();
(globalThis as typeof globalThis & Record<string, unknown>).document = happyWindow.document;
(globalThis as typeof globalThis & Record<string, unknown>).ShadowRoot = happyWindow.ShadowRoot;
(globalThis as typeof globalThis & Record<string, unknown>).Element = happyWindow.Element;

describe('isInShadowDOM', () => {
	test('returns false for regular DOM element', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);
		expect(isInShadowDOM(el)).toBe(false);
		el.remove();
	});

	test('returns true for element inside shadow root', () => {
		const host = document.createElement('div');
		document.body.appendChild(host);
		const shadow = host.attachShadow({ mode: 'open' });
		const inner = document.createElement('span');
		shadow.appendChild(inner);
		expect(isInShadowDOM(inner)).toBe(true);
		host.remove();
	});
});

describe('getShadowHost', () => {
	test('returns null for regular DOM element', () => {
		const el = document.createElement('div');
		expect(getShadowHost(el)).toBeNull();
	});

	test('returns host for shadow DOM element', () => {
		const host = document.createElement('div');
		document.body.appendChild(host);
		const shadow = host.attachShadow({ mode: 'open' });
		const inner = document.createElement('span');
		shadow.appendChild(inner);
		expect(getShadowHost(inner)).toBe(host);
		host.remove();
	});
});
