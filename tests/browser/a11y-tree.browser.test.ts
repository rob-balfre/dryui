import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import TreeHarness from './fixtures/tree-a11y-harness.svelte';
import { render } from './_harness';

function getTree(): HTMLElement {
	const tree = document.querySelector<HTMLElement>('[role="tree"]');
	if (!tree) throw new Error('Expected tree root');
	return tree;
}

function getItem(itemId: string): HTMLElement {
	const item = document.querySelector<HTMLElement>(`[role="treeitem"][data-item-id="${itemId}"]`);
	if (!item) throw new Error(`Expected treeitem ${itemId}`);
	return item;
}

function getLabel(itemId: string): HTMLElement {
	const label = getItem(itemId).querySelector<HTMLElement>('[data-part="label"]');
	if (!label) throw new Error(`Expected treeitem label ${itemId}`);
	return label;
}

function press(key: string) {
	const active = document.activeElement;
	if (!(active instanceof HTMLElement)) {
		throw new Error(`Expected an active element before pressing ${key}`);
	}

	active.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
	flushSync();
}

describe('Tree accessibility', () => {
	it('keeps focus on the treeitem and removes button semantics from the label', () => {
		render(TreeHarness);

		const tree = getTree();
		const documents = getItem('documents');
		const report = getItem('report');
		const label = getLabel('documents');

		expect(tree.getAttribute('role')).toBe('tree');
		expect(documents.getAttribute('tabindex')).toBe('0');
		expect(report.getAttribute('tabindex')).toBe('-1');
		expect(label.getAttribute('role')).toBeNull();
		expect(label.getAttribute('tabindex')).toBeNull();

		label.click();
		flushSync();

		expect(document.activeElement).toBe(documents);
		expect(documents.getAttribute('aria-selected')).toBe('true');
	});

	it('only applies aria-expanded to branch items and does not toggle expansion on selection', () => {
		render(TreeHarness);

		const documents = getItem('documents');
		const report = getItem('report');
		const notes = getItem('notes');

		expect(documents.getAttribute('aria-expanded')).toBe('true');
		expect(report.hasAttribute('aria-expanded')).toBe(false);
		expect(notes.hasAttribute('aria-expanded')).toBe(false);

		documents.focus();
		flushSync();

		press('ArrowLeft');
		expect(documents.getAttribute('aria-expanded')).toBe('false');

		getLabel('documents').click();
		flushSync();

		expect(document.activeElement).toBe(documents);
		expect(documents.getAttribute('aria-selected')).toBe('true');
		expect(documents.getAttribute('aria-expanded')).toBe('false');
	});

	it('supports up/down/home/end navigation across visible items', () => {
		render(TreeHarness);

		const documents = getItem('documents');
		const report = getItem('report');
		const notes = getItem('notes');

		documents.focus();
		flushSync();

		press('ArrowDown');
		expect(document.activeElement).toBe(report);

		press('ArrowDown');
		expect(document.activeElement).toBe(notes);

		press('ArrowUp');
		expect(document.activeElement).toBe(report);

		press('Home');
		expect(document.activeElement).toBe(documents);

		press('End');
		expect(document.activeElement).toBe(notes);
	});

	it('supports APG-style right and left branch navigation', () => {
		render(TreeHarness);

		const documents = getItem('documents');
		const report = getItem('report');

		documents.focus();
		flushSync();

		press('ArrowRight');
		expect(document.activeElement).toBe(report);

		press('ArrowLeft');
		expect(document.activeElement).toBe(documents);
		expect(documents.getAttribute('aria-expanded')).toBe('true');

		press('ArrowLeft');
		expect(document.activeElement).toBe(documents);
		expect(documents.getAttribute('aria-expanded')).toBe('false');

		press('ArrowRight');
		expect(document.activeElement).toBe(documents);
		expect(documents.getAttribute('aria-expanded')).toBe('true');

		press('ArrowRight');
		expect(document.activeElement).toBe(report);
	});
});
