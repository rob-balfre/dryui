import { describe, test, expect, beforeAll } from 'bun:test';
import { Window } from 'happy-dom';

let window: InstanceType<typeof Window>;
let document: Document;

beforeAll(() => {
	window = new Window();
	(window as any).SyntaxError = SyntaxError;
	document = window.document as unknown as Document;

	(globalThis as any).document = document;
	(globalThis as any).HTMLElement = window.HTMLElement;
	(globalThis as any).Node = window.Node;
	(globalThis as any).KeyboardEvent = window.KeyboardEvent;
});

async function loadEscapeHandler() {
	return await import('../../packages/primitives/src/utils/escape-handler.svelte.ts');
}

function dispatchKey(key: string): KeyboardEvent {
	const ev = new (window.KeyboardEvent as unknown as typeof KeyboardEvent)('keydown', {
		key,
		bubbles: true,
		cancelable: true
	});
	document.dispatchEvent(ev);
	return ev;
}

describe('createEscapeHandler', () => {
	test('fires onEscape exactly once per Escape keypress', async () => {
		const { createEscapeHandler } = await loadEscapeHandler();
		let count = 0;
		const cleanup = createEscapeHandler(() => {
			count++;
		});

		dispatchKey('Escape');
		expect(count).toBe(1);

		dispatchKey('Escape');
		expect(count).toBe(2);

		cleanup();
	});

	test('does not fire for other keys', async () => {
		const { createEscapeHandler } = await loadEscapeHandler();
		let count = 0;
		const cleanup = createEscapeHandler(() => {
			count++;
		});

		dispatchKey('a');
		dispatchKey('Enter');
		dispatchKey('ArrowDown');
		expect(count).toBe(0);

		cleanup();
	});

	test('cleanup removes the listener so onEscape no longer fires', async () => {
		const { createEscapeHandler } = await loadEscapeHandler();
		let count = 0;
		const cleanup = createEscapeHandler(() => {
			count++;
		});

		dispatchKey('Escape');
		expect(count).toBe(1);

		cleanup();

		dispatchKey('Escape');
		expect(count).toBe(1);
	});

	test('multiple concurrent handlers all fire', async () => {
		const { createEscapeHandler } = await loadEscapeHandler();
		let a = 0;
		let b = 0;
		const cleanupA = createEscapeHandler(() => {
			a++;
		});
		const cleanupB = createEscapeHandler(() => {
			b++;
		});

		dispatchKey('Escape');
		expect(a).toBe(1);
		expect(b).toBe(1);

		cleanupA();
		cleanupB();
	});
});
