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

	it('marks the selected toggle as on and the disabled-on toggle as both on and disabled', () => {
		renderToggleHarness();

		const selected = getToggleParts('selected');
		const disabledOn = getToggleParts('disabled-on');
		const disabledOff = getToggleParts('disabled-off');

		expect(selected.root.dataset.state).toBe('on');
		expect(selected.root.dataset.disabled).toBeUndefined();
		expect(selected.track.getAttribute('aria-checked')).toBe('true');

		expect(disabledOn.root.dataset.state).toBe('on');
		expect(disabledOn.root.dataset.disabled).toBe('true');
		expect(disabledOn.track.disabled).toBe(true);

		expect(disabledOff.root.dataset.state).toBe('off');
		expect(disabledOff.root.dataset.disabled).toBe('true');
	});

	it('only marks the label disabled when the disabled toggle is unselected', () => {
		renderToggleHarness();

		const disabledOffLabel = getToggleParts('disabled-off').label;
		const disabledOnLabel = getToggleParts('disabled-on').label;

		expect(disabledOffLabel.dataset.disabled).toBe('true');
		expect(disabledOnLabel.dataset.disabled).toBeUndefined();
	});

	it('applies the dark theme scope so dark tokens cascade to toggle internals', () => {
		document.documentElement.dataset.theme = 'dark';
		renderToggleHarness();

		const medium = getToggleParts('medium');
		const selected = getToggleParts('selected');

		expect(document.documentElement.dataset.theme).toBe('dark');
		expect(medium.root.dataset.state).toBe('off');
		expect(selected.root.dataset.state).toBe('on');

		const brandFill = getComputedStyle(document.documentElement)
			.getPropertyValue('--dry-color-fill-brand')
			.trim();
		expect(brandFill.length).toBeGreaterThan(0);
	});
});
