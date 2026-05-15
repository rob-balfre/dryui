import { describe, expect, it } from 'vitest';
import DateTimeInputHarness from './fixtures/date-time-input-harness.svelte';
import { render } from './_harness';

type Size = 'sm' | 'md' | 'lg';
const expectedIso = '2026-05-12T22:30:00.000Z';

function getRoot(target: HTMLElement, testId: string): HTMLElement {
	const root = target.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
	if (!root) {
		throw new Error(`Expected DateTimeInput root ${testId}`);
	}
	return root;
}

function getTrigger(root: HTMLElement, selector: string, label: string): HTMLButtonElement {
	const trigger = root.querySelector<HTMLButtonElement>(selector);
	if (!(trigger instanceof HTMLButtonElement)) {
		throw new Error(`Expected ${label} trigger`);
	}
	return trigger;
}

function getDateTrigger(root: HTMLElement): HTMLButtonElement {
	return getTrigger(root, 'button[aria-haspopup="dialog"]', 'date');
}

function getTimeTrigger(root: HTMLElement, label: 'Hour' | 'Minute'): HTMLButtonElement {
	return getTrigger(
		root,
		`button[data-select-trigger][aria-label="${label}"]`,
		label.toLowerCase()
	);
}

function getOutput(target: HTMLElement, testId: string): HTMLOutputElement {
	const output = target.querySelector<HTMLOutputElement>(`[data-testid="${testId}"]`);
	if (!(output instanceof HTMLOutputElement)) {
		throw new Error(`Expected output ${testId}`);
	}
	return output;
}

function expectSameHeight(a: HTMLElement, b: HTMLElement) {
	const aHeight = a.getBoundingClientRect().height;
	const bHeight = b.getBoundingClientRect().height;

	expect(aHeight).toBeGreaterThan(0);
	expect(bHeight).toBeGreaterThan(0);
	expect(Math.abs(aHeight - bHeight)).toBeLessThan(1);
}

describe('DateTimeInput', () => {
	it('renders the default md composition with a hidden input and bound value', () => {
		const target = render(DateTimeInputHarness).target;
		const root = getRoot(target, 'dti-default');
		const hidden = root.querySelector<HTMLInputElement>('input[type="hidden"][name="appointment"]');
		const value = getOutput(target, 'default-value');

		expect(root.hasAttribute('data-date-time-input')).toBe(true);
		expect(getDateTrigger(root).getAttribute('data-size')).toBe('md');
		expect(getTimeTrigger(root, 'Hour').getAttribute('data-size')).toBe('md');
		expect(getTimeTrigger(root, 'Minute').getAttribute('data-size')).toBe('md');
		expect(hidden).toBeInstanceOf(HTMLInputElement);
		expect(hidden?.value).toBe(expectedIso);
		expect(value.textContent).toBe(expectedIso);
	});

	it('keeps the date trigger and both time select triggers height-aligned by size', () => {
		const target = render(DateTimeInputHarness).target;

		for (const size of ['sm', 'md', 'lg'] as const satisfies readonly Size[]) {
			const root = getRoot(target, `dti-${size}`);
			const dateTrigger = getDateTrigger(root);
			const hourTrigger = getTimeTrigger(root, 'Hour');
			const minuteTrigger = getTimeTrigger(root, 'Minute');

			expect(dateTrigger.getAttribute('data-size')).toBe(size);
			expect(hourTrigger.getAttribute('data-size')).toBe(size);
			expect(minuteTrigger.getAttribute('data-size')).toBe(size);
			expectSameHeight(dateTrigger, hourTrigger);
			expectSameHeight(dateTrigger, minuteTrigger);
		}
	});
});
