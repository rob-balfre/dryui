import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import DragAndDropA11yHarness from './fixtures/drag-and-drop-a11y-harness.svelte';
import { render } from './_harness';

async function nextFrame() {
	await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
	flushSync();
}

function getRoot(testId: string) {
	const root = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
	if (!(root instanceof HTMLDivElement)) {
		throw new Error(`Expected drag-and-drop root for ${testId}`);
	}
	return root;
}

function getItems(root: HTMLElement) {
	return Array.from(root.querySelectorAll<HTMLElement>('[data-dnd-item]'));
}

function getHandles(root: HTMLElement) {
	return Array.from(root.querySelectorAll<HTMLElement>('[data-dnd-handle]'));
}

function getLabels(root: HTMLElement) {
	return getItems(root)
		.map((item) => item.querySelector<HTMLElement>('[data-item-label]')?.textContent?.trim() ?? '')
		.filter(Boolean);
}

function getLiveRegion(root: HTMLElement) {
	const liveRegion = root.querySelector<HTMLElement>('[data-dnd-live-region]');
	if (!(liveRegion instanceof HTMLDivElement)) {
		throw new Error('Expected drag-and-drop live region');
	}
	return liveRegion;
}

function getInstructions(root: HTMLElement) {
	const instructions = root.querySelector<HTMLElement>('[data-dnd-instructions]');
	if (!(instructions instanceof HTMLDivElement)) {
		throw new Error('Expected drag-and-drop instructions');
	}
	return instructions;
}

function pressKey(element: HTMLElement, key: string) {
	element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key }));
	flushSync();
}

describe('DragAndDrop accessibility remediations', () => {
	it('uses sortable list semantics instead of listbox and option roles', () => {
		render(DragAndDropA11yHarness);

		const uiHandlelessRoot = getRoot('ui-handleless-root');
		const uiHandleRoot = getRoot('ui-handle-root');
		const primitiveHandleRoot = getRoot('primitive-handle-root');

		expect(document.querySelector('[role="listbox"]')).toBeNull();
		expect(document.querySelector('[role="option"]')).toBeNull();

		for (const root of [uiHandlelessRoot, uiHandleRoot, primitiveHandleRoot]) {
			expect(root.getAttribute('role')).toBe('list');
			expect(root.getAttribute('aria-roledescription')).toBe('sortable list');
			expect(root.getAttribute('aria-describedby')).toContain(
				getInstructions(root).getAttribute('id') ?? ''
			);

			const items = getItems(root);
			expect(items.length).toBeGreaterThan(0);

			for (const [index, item] of items.entries()) {
				expect(item.getAttribute('role')).toBe('listitem');
				expect(item.getAttribute('aria-roledescription')).toBe('sortable item');
				expect(item.getAttribute('aria-posinset')).toBe(String(index + 1));
				expect(item.getAttribute('aria-setsize')).toBe(String(items.length));
			}
		}

		expect(getInstructions(uiHandlelessRoot).textContent).toContain('Focus an item');
		expect(getItems(uiHandlelessRoot)[0]?.getAttribute('tabindex')).toBe('0');
		expect(getItems(uiHandlelessRoot)[0]?.getAttribute('aria-keyshortcuts')).toBe(
			'ArrowUp ArrowDown'
		);

		expect(getInstructions(uiHandleRoot).textContent).toContain('Use the reorder handle');
		expect(getItems(uiHandleRoot)[0]?.getAttribute('tabindex')).toBeNull();
		expect(getHandles(uiHandleRoot)[0]?.getAttribute('role')).toBe('button');
		expect(getHandles(uiHandleRoot)[0]?.getAttribute('aria-label')).toBe('Reorder item 1');
		expect(getHandles(uiHandleRoot)[0]?.getAttribute('aria-pressed')).toBeNull();
	});

	it('reorders a handleless UI list with arrow keys and announces the new position', async () => {
		render(DragAndDropA11yHarness);

		const root = getRoot('ui-handleless-root');
		const [firstItem] = getItems(root);
		if (!firstItem) {
			throw new Error('Expected first handleless item');
		}

		firstItem.focus();
		pressKey(firstItem, 'ArrowDown');
		await nextFrame();

		expect(getLabels(root)).toEqual([
			'Review pull requests',
			'Design system audit',
			'Update documentation'
		]);
		expect(getLiveRegion(root).textContent).toContain('Item moved to position 2 of 3');
		expect(document.activeElement?.textContent).toContain('Design system audit');
	});

	it('lets handle-based lists reorder from the handle in UI and primitives', async () => {
		render(DragAndDropA11yHarness);

		const cases = [
			{
				root: getRoot('ui-handle-root'),
				expected: ['QA release build', 'Plan milestones', 'Publish changelog']
			},
			{
				root: getRoot('primitive-handle-root'),
				expected: ['Refine component API', 'Backlog review', 'Ship documentation']
			}
		];

		for (const { root, expected } of cases) {
			const [firstHandle] = getHandles(root);
			if (!firstHandle) {
				throw new Error('Expected reorder handle');
			}

			firstHandle.focus();
			pressKey(firstHandle, 'ArrowDown');
			await nextFrame();

			expect(getLabels(root)).toEqual(expected);
			expect(getLiveRegion(root).textContent).toContain('Item moved to position 2 of 3');
			expect(document.activeElement?.getAttribute('role')).toBe('button');
		}
	});
});
