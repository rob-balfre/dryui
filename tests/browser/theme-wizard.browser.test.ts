import { afterEach, describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import { resetToDefaults, wizardState } from '../../packages/theme-wizard/src/index.js';
import ThemeWizardControlsHarness from './fixtures/theme-wizard-controls-harness.svelte';
import { render } from './_harness';

afterEach(() => {
	resetToDefaults();
	sessionStorage.clear();
	localStorage.clear();
	document.documentElement.classList.remove('theme-auto');
	document.documentElement.removeAttribute('data-theme');
});

function normalizeText(value: string | null | undefined) {
	return value?.replace(/\s+/g, ' ').trim() ?? '';
}

function renderPage() {
	return render(ThemeWizardControlsHarness).target;
}

function getButtonByText(scope: ParentNode, label: string, selector = 'button') {
	const button = Array.from(scope.querySelectorAll<HTMLButtonElement>(selector)).find(
		(node) => normalizeText(node.textContent) === label
	);

	if (!(button instanceof HTMLButtonElement)) {
		throw new Error(`Expected button with label "${label}"`);
	}

	return button;
}

async function openMenu(target: HTMLElement, label: string) {
	getButtonByText(target, label, '[data-mega-menu-trigger]').click();
	await new Promise((resolve) => setTimeout(resolve, 175));
	flushSync();

	const panel = document.querySelector<HTMLDivElement>('[data-mega-menu-panel]:popover-open');
	if (!(panel instanceof HTMLDivElement)) {
		throw new Error(`Expected open mega menu panel for "${label}"`);
	}

	return panel;
}

describe('theme wizard controls', () => {
	it('updates typography and shape state from mega menu toggle groups', async () => {
		const target = renderPage();

		let panel = await openMenu(target, 'Typography');
		getButtonByText(panel, 'Serif').click();
		flushSync();

		expect(wizardState.typography.fontPreset).toBe('Serif');

		getButtonByText(panel, 'Spacious').click();
		flushSync();

		expect(wizardState.typography.scale).toBe('spacious');

		panel = await openMenu(target, 'Shape');
		getButtonByText(panel, 'Rich').click();
		flushSync();

		expect(wizardState.personality).toBe('rich');
		expect(wizardState.shape.radiusPreset).toBe('rounded');

		getButtonByText(panel, 'Pill').click();
		flushSync();

		expect(wizardState.shape.radiusPreset).toBe('pill');

		getButtonByText(panel, 'Spacious').click();
		flushSync();

		expect(wizardState.shape.density).toBe('spacious');
	});
});
