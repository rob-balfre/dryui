import { afterEach, describe, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import StudioShellHarness from './fixtures/studio-shell-harness.svelte';

const mountedComponents: ReturnType<typeof mount>[] = [];

afterEach(() => {
	for (const component of mountedComponents.splice(0)) {
		unmount(component);
	}

	document.body.replaceChildren();
	document.documentElement.className = '';
	delete document.documentElement.dataset.theme;
	localStorage.clear();
});

function mountStudio() {
	const target = document.createElement('div');
	document.body.append(target);

	const component = mount(StudioShellHarness, { target });
	mountedComponents.push(component);
	flushSync();

	return component;
}

describe('studio shell', () => {
	it('filters the palette and inserts a selected component into the live canvas', () => {
		mountStudio();

		const search = document.querySelector('input[aria-label="Search components"]');
		if (!(search instanceof HTMLInputElement)) {
			throw new Error('Expected the palette search input');
		}

		search.value = 'slider';
		search.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();

		expect(document.body.textContent).toContain('Slider');
		expect(document.body.textContent).not.toContain('Accordion');

		const sliderButton = Array.from(document.querySelectorAll('button')).find((button) =>
			button.textContent?.includes('Slider')
		);
		if (!(sliderButton instanceof HTMLButtonElement)) {
			throw new Error('Expected a slider palette item');
		}

		const canvasViewport = document.querySelector('[data-studio-canvas-viewport]');
		if (!(canvasViewport instanceof HTMLElement)) {
			throw new Error('Expected the studio canvas viewport');
		}

		const dataTransfer = new DataTransfer();
		sliderButton.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer }));
		canvasViewport.dispatchEvent(
			new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer })
		);
		canvasViewport.dispatchEvent(
			new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer })
		);
		flushSync();

		expect(document.body.textContent).toContain('Slider');
		expect(document.body.textContent).toContain('Selected: Slider');
		expect(document.body.textContent).not.toContain('AI transcript');
	});

	it('switches theme mode, sends a chat command, and advances calibration', () => {
		mountStudio();

		const darkButton = Array.from(document.querySelectorAll('button')).find(
			(button) => button.textContent?.trim() === 'Dark'
		);
		if (!(darkButton instanceof HTMLButtonElement)) {
			throw new Error('Expected a dark theme button');
		}
		darkButton.click();

		expect(document.documentElement.dataset.theme).toBe('dark');
		expect(localStorage.getItem('dryui-studio-theme')).toBe('dark');

		const textarea = document.querySelector('textarea[aria-label="Prompt"]');
		if (!(textarea instanceof HTMLTextAreaElement)) {
			throw new Error('Expected the chat textarea');
		}

		textarea.value = 'Add button';
		textarea.dispatchEvent(new Event('input', { bubbles: true }));

		const sendButton = Array.from(document.querySelectorAll('button')).find(
			(button) => button.textContent?.trim() === 'Send'
		);
		if (!(sendButton instanceof HTMLButtonElement)) {
			throw new Error('Expected the send button');
		}
		sendButton.click();
		flushSync();

		expect(document.body.textContent).toContain('Add button');
		expect(document.body.textContent).toContain('Prepared a preview that inserts Button');

		const applyPreviewButton = Array.from(document.querySelectorAll('button')).find(
			(button) => button.textContent?.trim() === 'Apply preview'
		);
		if (!(applyPreviewButton instanceof HTMLButtonElement)) {
			throw new Error('Expected the apply preview button');
		}
		applyPreviewButton.click();
		flushSync();

		expect(document.body.textContent).toContain(
			'Applied preview: Insert Button into the live canvas.'
		);

		const webcamSwitch = document.querySelector('button[aria-checked], button[role="switch"]');
		if (!(webcamSwitch instanceof HTMLButtonElement)) {
			throw new Error('Expected the webcam switch');
		}
		webcamSwitch.click();
		flushSync();

		expect(document.body.textContent).toContain('Live tracking enabled');

		const calibrationButton = Array.from(document.querySelectorAll('button')).find(
			(button) => button.textContent?.trim() === 'Advance calibration'
		);
		if (!(calibrationButton instanceof HTMLButtonElement)) {
			throw new Error('Expected the calibration button');
		}
		calibrationButton.click();
		flushSync();

		expect(document.body.textContent).toContain('Sample lighting');
	});
});
