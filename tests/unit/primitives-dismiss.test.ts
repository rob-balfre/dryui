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
});

async function loadDismiss() {
	return await import('../../packages/primitives/src/utils/dismiss.svelte.ts');
}

describe('isInsideDismissRegion', () => {
	test('returns true when the target is inside contentEl', async () => {
		const { isInsideDismissRegion } = await loadDismiss();
		const contentEl = document.createElement('div');
		const child = document.createElement('span');
		contentEl.appendChild(child);
		document.body.appendChild(contentEl);

		expect(isInsideDismissRegion(child as unknown as EventTarget, { contentEl })).toBe(true);
		expect(isInsideDismissRegion(contentEl as unknown as EventTarget, { contentEl })).toBe(true);
	});

	test('returns true when the target is inside triggerEl', async () => {
		const { isInsideDismissRegion } = await loadDismiss();
		const triggerEl = document.createElement('button');
		const label = document.createElement('span');
		triggerEl.appendChild(label);
		document.body.appendChild(triggerEl);

		expect(isInsideDismissRegion(label as unknown as EventTarget, { triggerEl })).toBe(true);
	});

	test('returns true when the target is inside containerEl (legacy fallback)', async () => {
		const { isInsideDismissRegion } = await loadDismiss();
		const containerEl = document.createElement('div');
		const inner = document.createElement('span');
		containerEl.appendChild(inner);
		document.body.appendChild(containerEl);

		expect(isInsideDismissRegion(inner as unknown as EventTarget, { containerEl })).toBe(true);
	});

	test('returns false when the target is outside all provided regions', async () => {
		const { isInsideDismissRegion } = await loadDismiss();
		const contentEl = document.createElement('div');
		const triggerEl = document.createElement('button');
		const outside = document.createElement('div');
		document.body.appendChild(contentEl);
		document.body.appendChild(triggerEl);
		document.body.appendChild(outside);

		expect(isInsideDismissRegion(outside as unknown as EventTarget, { contentEl, triggerEl })).toBe(
			false
		);
	});

	test('returns false when target is not a Node (e.g. null or a window)', async () => {
		const { isInsideDismissRegion } = await loadDismiss();
		const contentEl = document.createElement('div');
		document.body.appendChild(contentEl);

		expect(isInsideDismissRegion(null, { contentEl })).toBe(false);
		expect(isInsideDismissRegion({} as EventTarget, { contentEl })).toBe(false);
	});

	test('returns false when no regions are provided', async () => {
		const { isInsideDismissRegion } = await loadDismiss();
		const node = document.createElement('div');
		document.body.appendChild(node);
		expect(isInsideDismissRegion(node as unknown as EventTarget, {})).toBe(false);
	});

	test('handles null region refs gracefully', async () => {
		const { isInsideDismissRegion } = await loadDismiss();
		const node = document.createElement('div');
		document.body.appendChild(node);
		expect(
			isInsideDismissRegion(node as unknown as EventTarget, {
				contentEl: null,
				triggerEl: null,
				containerEl: null
			})
		).toBe(false);
	});
});
