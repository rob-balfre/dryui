import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import RichTextEditorDemo from '../../apps/docs/src/lib/demos/RichTextEditorDemo.svelte';
import TransferDemo from '../../apps/docs/src/lib/demos/TransferDemo.svelte';
import { render } from './_harness';

async function nextFrame() {
	await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
	flushSync();
}

function getTransferLists() {
	return Array.from(document.querySelectorAll<HTMLElement>('[data-transfer-list]'));
}

function getTransferItems() {
	return Array.from(document.querySelectorAll<HTMLElement>('[data-transfer-item]'));
}

function getRichTextEditorContent() {
	const content = document.querySelector<HTMLElement>('[data-rte-content]');
	if (!(content instanceof HTMLDivElement)) {
		throw new Error('Expected rich text editor content element');
	}
	return content;
}

function getLinkButton() {
	const button = document.querySelector<HTMLButtonElement>('button[aria-label="Insert link"]');
	if (!(button instanceof HTMLButtonElement)) {
		throw new Error('Expected insert-link button');
	}
	return button;
}

function getLinkInput() {
	const input = document.querySelector<HTMLInputElement>('[data-part="linkInput"]');
	if (!(input instanceof HTMLInputElement)) {
		throw new Error('Expected link URL input');
	}
	return input;
}

function moveCaretToEnd(element: HTMLElement) {
	const selection = window.getSelection();
	const range = document.createRange();
	range.selectNodeContents(element);
	range.collapse(false);
	selection?.removeAllRanges();
	selection?.addRange(range);
}

describe('Transfer and rich text editor accessibility remediations', () => {
	it('renders transfer lists as grouped checkboxes instead of listbox options', () => {
		render(TransferDemo);

		const lists = getTransferLists();
		const items = getTransferItems();

		expect(lists).toHaveLength(2);
		expect(items.length).toBeGreaterThan(0);

		for (const list of lists) {
			expect(list.getAttribute('role')).toBe('group');
			expect(list.getAttribute('aria-label')).toBeTruthy();
		}

		for (const item of items) {
			expect(item.getAttribute('role')).toBeNull();
			expect(item.getAttribute('aria-selected')).toBeNull();
		}

		const itemCheckboxes = document.querySelectorAll('[data-transfer-item] input[type="checkbox"]');
		expect(itemCheckboxes.length).toBe(items.length);
		expect(document.querySelector('[role="listbox"]')).toBeNull();
		expect(document.querySelector('[role="option"]')).toBeNull();
	});

	it('opens a named link input from Ctrl+K and returns focus to the editor after apply', async () => {
		render(RichTextEditorDemo);

		const content = getRichTextEditorContent();
		content.focus();
		moveCaretToEnd(content);

		content.dispatchEvent(
			new KeyboardEvent('keydown', {
				bubbles: true,
				ctrlKey: true,
				key: 'k'
			})
		);

		await nextFrame();

		const linkInput = getLinkInput();
		expect(linkInput.getAttribute('aria-label')).toBe('Link URL');
		expect(document.activeElement).toBe(linkInput);

		linkInput.value = 'https://example.com';
		linkInput.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();
		linkInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		flushSync();

		const link = content.querySelector<HTMLAnchorElement>('a');
		expect(link?.getAttribute('href')).toBe('https://example.com');
		expect(link?.getAttribute('target')).toBe('_blank');
		expect(link?.getAttribute('rel')).toContain('noopener');
		expect(document.activeElement).toBe(content);
		expect(document.querySelector('[data-part="linkInput"]')).toBeNull();
	});

	it('returns focus to the trigger when the link editor is cancelled from the toolbar', async () => {
		render(RichTextEditorDemo);

		const linkButton = getLinkButton();
		linkButton.focus();
		linkButton.click();

		await nextFrame();

		const linkInput = getLinkInput();
		expect(document.activeElement).toBe(linkInput);

		linkInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		flushSync();

		expect(document.querySelector('[data-part="linkInput"]')).toBeNull();
		expect(document.activeElement).toBe(linkButton);
	});
});
