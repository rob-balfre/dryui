import { afterEach, describe, expect, it } from 'vitest';
import ToggleHarness from './fixtures/toggle-harness.svelte';
import { render } from './_harness';

afterEach(() => {
	delete document.documentElement.dataset.theme;
});

function renderToggleHarness() {
	return render(ToggleHarness).target;
}

function getToggleParts(testId: string) {
	const wrapper = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);

	if (!wrapper) {
		throw new Error(`Expected wrapper for ${testId}`);
	}

	const root = wrapper.firstElementChild;

	if (!(root instanceof HTMLElement)) {
		throw new Error(`Expected root for ${testId}`);
	}

	const track = root.querySelector('button');

	if (!(track instanceof HTMLButtonElement)) {
		throw new Error(`Expected track button for ${testId}`);
	}

	const label = root.lastElementChild;

	if (!(label instanceof HTMLElement)) {
		throw new Error(`Expected label for ${testId}`);
	}

	return { root, track, label };
}

describe('Toggle', () => {
	it('matches the Figma spacing for medium and small sizes', () => {
		renderToggleHarness();

		const medium = getToggleParts('medium').root;
		const small = getToggleParts('small').root;

		expect(getComputedStyle(medium).gap).toBe('12px');
		expect(getComputedStyle(small).gap).toBe('8px');
	});

	it('keeps the selected track on-brand and uses the muted disabled fill from Figma', () => {
		renderToggleHarness();

		const selectedTrack = getToggleParts('selected').track;
		const disabledTrack = getToggleParts('disabled-on').track;

		expect(getComputedStyle(selectedTrack).backgroundColor).toBe('rgb(76, 100, 217)');
		expect(getComputedStyle(disabledTrack).backgroundColor).toBe('rgba(0, 17, 102, 0.1)');
	});

	it('only mutes the label when the disabled toggle is unselected', () => {
		renderToggleHarness();

		const disabledOffLabel = getToggleParts('disabled-off').label;
		const disabledOnLabel = getToggleParts('disabled-on').label;

		expect(getComputedStyle(disabledOffLabel).color).toBe('rgba(0, 17, 102, 0.1)');
		expect(getComputedStyle(disabledOnLabel).color).toBe('rgba(0, 6, 38, 0.9)');
	});

	it('uses dark theme label and track colors when the page theme is dark', () => {
		document.documentElement.dataset.theme = 'dark';
		renderToggleHarness();

		const mediumTrack = getToggleParts('medium').track;
		const mediumLabel = getToggleParts('medium').label;
		const selectedTrack = getToggleParts('selected').track;

		expect(getComputedStyle(mediumTrack).backgroundColor).toBe('rgba(255, 255, 255, 0.06)');
		expect(getComputedStyle(mediumLabel).color).toBe('rgb(255, 255, 255)');
		expect(getComputedStyle(selectedTrack).backgroundColor).toBe('rgb(163, 178, 255)');
	});
});
