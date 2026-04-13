import { afterEach, describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import StudioShellHarness from './fixtures/studio-shell-harness.svelte';
import { render } from './_harness';

afterEach(() => {
	document.documentElement.className = '';
	delete document.documentElement.dataset.theme;
	localStorage.clear();
});

function mountStudio() {
	render(StudioShellHarness);
}

describe('studio ai', () => {
	it('previews and applies AI-generated component inserts', () => {
		mountStudio();

		const textarea = document.querySelector('textarea[aria-label="Prompt"]');
		if (!(textarea instanceof HTMLTextAreaElement)) {
			throw new Error('Expected the chat textarea');
		}

		textarea.value = 'Add card';
		textarea.dispatchEvent(new Event('input', { bubbles: true }));

		const sendButton = Array.from(document.querySelectorAll('button')).find(
			(button) => button.textContent?.trim() === 'Send'
		);
		if (!(sendButton instanceof HTMLButtonElement)) {
			throw new Error('Expected the send button');
		}
		sendButton.click();
		flushSync();

		expect(document.body.textContent).toContain('Prepared a preview that inserts Card');
		expect(document.body.textContent).toContain('Insert Card into the live canvas');

		const applyButton = Array.from(document.querySelectorAll('button')).find(
			(button) => button.textContent?.trim() === 'Apply preview'
		);
		if (!(applyButton instanceof HTMLButtonElement)) {
			throw new Error('Expected the apply preview button');
		}
		applyButton.click();
		flushSync();

		expect(document.body.textContent).toContain(
			'Applied preview: Insert Card into the live canvas.'
		);
		expect(document.body.textContent).toContain('Selected: Card');
	});
});
