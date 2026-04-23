import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import RichTextEditorSecurityHarness from './fixtures/rich-text-editor-security-harness.svelte';
import { render } from './_harness';

async function nextFrame() {
	await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
	flushSync();
}

function getContent(testId: string) {
	const content = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
	if (!(content instanceof HTMLDivElement)) {
		throw new Error(`Expected rich text editor content for ${testId}`);
	}
	return content;
}

function getOutput(testId: string) {
	const output = document.querySelector<HTMLOutputElement>(`[data-testid="${testId}"]`);
	if (!(output instanceof HTMLOutputElement)) {
		throw new Error(`Expected output for ${testId}`);
	}
	return output;
}

function expectSanitizedHtml(html: string) {
	expect(html).not.toContain('<script');
	expect(html).not.toContain('onclick');
	expect(html).not.toContain('onerror');
	expect(html).not.toContain('javascript:');
	expect(html).not.toContain('<img');
	expect(html).not.toContain('style=');
}

describe('RichTextEditor sanitization', () => {
	it('sanitizes incoming value HTML before rendering in UI and primitives', async () => {
		render(RichTextEditorSecurityHarness);
		await nextFrame();

		for (const testId of ['ui-rte-content', 'primitive-rte-content']) {
			const content = getContent(testId);
			expectSanitizedHtml(content.innerHTML);

			const goodLink = content.querySelector<HTMLAnchorElement>('a[href="https://example.com"]');
			expect(goodLink?.getAttribute('target')).toBe('_blank');
			expect(goodLink?.getAttribute('rel')).toBe('noopener noreferrer');
		}
	});

	it('sanitizes edited HTML before emitting bind:value', async () => {
		render(RichTextEditorSecurityHarness);
		await nextFrame();

		for (const [contentId, outputId] of [
			['ui-rte-content', 'ui-rte-value'],
			['primitive-rte-content', 'primitive-rte-value']
		] as const) {
			const content = getContent(contentId);
			const output = getOutput(outputId);

			content.innerHTML =
				'<p onclick="alert(1)">Paste <a href="data:text/html,evil" onmouseover="alert(1)">bad</a><strong style="color:red">ok</strong></p>';
			content.dispatchEvent(new Event('input', { bubbles: true }));
			flushSync();

			expectSanitizedHtml(content.innerHTML);
			expectSanitizedHtml(output.textContent ?? '');
			expect(output.textContent).toContain('<strong>ok</strong>');
		}
	});
});
