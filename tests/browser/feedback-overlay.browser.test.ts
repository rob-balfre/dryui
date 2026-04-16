import { flushSync } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import FeedbackOverlayHarness from './fixtures/feedback-overlay-harness.svelte';
import { render } from './_harness';

type HostKind = 'command-palette' | 'popover';

afterEach(() => {
	delete document.documentElement.dataset.theme;
	document.documentElement.classList.remove('theme-auto');
});

function mountFeedback(kind: HostKind) {
	document.documentElement.dataset.theme = 'dark';
	render(FeedbackOverlayHarness, { kind });

	const drawButton = document.querySelector<HTMLButtonElement>('[aria-label="Draw"]');
	if (!drawButton) {
		throw new Error(`Expected feedback toolbar for ${kind}`);
	}

	drawButton.click();
	flushSync();

	const root = document.querySelector<HTMLElement>('[data-dryui-feedback]');
	const toolbar = document.querySelector<HTMLElement>('[role="toolbar"]');
	const canvas = document.querySelector<SVGSVGElement>('[aria-label="Feedback drawing canvas"]');

	if (!root || !toolbar || !canvas) {
		throw new Error(`Expected mounted feedback overlay for ${kind}`);
	}

	return { root, toolbar, canvas };
}

function expectNear(actual: number, expected: number, epsilon = 2) {
	expect(Math.abs(actual - expected)).toBeLessThanOrEqual(epsilon);
}

describe('feedback overlay hosting', () => {
	it.each(['command-palette', 'popover'] as const)(
		'keeps the feedback overlay aligned to the viewport inside %s',
		(kind) => {
			const { root, toolbar, canvas } = mountFeedback(kind);
			const rootRect = root.getBoundingClientRect();
			const toolbarRect = toolbar.getBoundingClientRect();
			const canvasRect = canvas.getBoundingClientRect();

			expectNear(rootRect.left, 0);
			expectNear(rootRect.top, 0);
			expectNear(rootRect.width, window.innerWidth);
			expectNear(rootRect.height, window.innerHeight);
			expectNear(canvasRect.left, 0);
			expectNear(canvasRect.top, 0);
			expectNear(canvasRect.width, window.innerWidth);
			expectNear(canvasRect.height, window.innerHeight);
			expectNear(toolbarRect.right, window.innerWidth - 24);
			expectNear(toolbarRect.bottom, window.innerHeight - 24);
		}
	);
});
