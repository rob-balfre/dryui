import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import ThemeWizardPreviewHarness from './fixtures/theme-wizard-preview-harness.svelte';
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

function getHandles(root: HTMLElement) {
	return Array.from(root.querySelectorAll<HTMLElement>('[data-dnd-handle]'));
}

function getLabels(root: HTMLElement) {
	return Array.from(root.querySelectorAll<HTMLElement>('[data-dnd-item]'))
		.map(
			(item) => item.querySelector<HTMLElement>('.workflow-module-title')?.textContent?.trim() ?? ''
		)
		.filter(Boolean);
}

describe('theme wizard preview', () => {
	it('renders a draggable module board and reorders modules from the handle', async () => {
		render(ThemeWizardPreviewHarness);

		const root = getRoot('theme-wizard-module-column-above-fold');
		const [firstHandle] = getHandles(root);
		if (!firstHandle) {
			throw new Error('Expected drag-and-drop handle');
		}

		expect(getLabels(root)).toEqual(['Hero statement', 'Search rail', 'Signal strip']);

		firstHandle.focus();
		firstHandle.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		await nextFrame();

		expect(getLabels(root)).toEqual(['Search rail', 'Hero statement', 'Signal strip']);
	});
});
