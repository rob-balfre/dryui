import { afterEach, describe, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import DateFieldHarness from './fixtures/date-field-harness.svelte';

describe('DateField', () => {
	let cleanup: (() => void) | undefined;

	afterEach(() => {
		cleanup?.();
		cleanup = undefined;
	});

	function setup() {
		const target = document.createElement('div');
		document.body.appendChild(target);
		const instance = mount(DateFieldHarness, { target });
		flushSync();
		cleanup = () => {
			unmount(instance);
			target.remove();
		};
		return target;
	}

	function typeKey(key: string) {
		const activeElement = document.activeElement;
		if (!(activeElement instanceof HTMLElement)) {
			throw new Error(`Expected an active element before typing "${key}"`);
		}

		activeElement.dispatchEvent(
			new KeyboardEvent('keydown', {
				key,
				bubbles: true,
				cancelable: true
			})
		);
		flushSync();
	}

	it('renders the styled DateField hooks', () => {
		const target = setup();
		const root = target.querySelector('[data-testid="root"]') as HTMLDivElement;
		const month = target.querySelector('[data-testid="segment-month"]') as HTMLSpanElement;
		const separator = target.querySelector('[data-testid="separator-month-day"]') as HTMLSpanElement;

		expect(root.hasAttribute('data-df-wrapper')).toBe(true);
		expect(root.hasAttribute('data-df-root')).toBe(true);
		expect(root.dataset['size']).toBe('md');
		expect(month.hasAttribute('data-df-segment')).toBe(true);
		expect(separator.hasAttribute('data-df-separator')).toBe(true);
	});

	it('focuses a segment on mouse down so typing works after clicking the field', () => {
		const target = setup();
		const root = target.querySelector('[data-testid="root"]') as HTMLDivElement;
		const month = target.querySelector('[data-testid="segment-month"]') as HTMLSpanElement;
		const day = target.querySelector('[data-testid="segment-day"]') as HTMLSpanElement;
		const year = target.querySelector('[data-testid="segment-year"]') as HTMLSpanElement;

		root.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		flushSync();

		expect(document.activeElement).toBe(month);

		typeKey('1');
		typeKey('2');
		expect(month.textContent).toBe('12');
		expect(document.activeElement).toBe(day);

		typeKey('3');
		typeKey('1');
		expect(day.textContent).toBe('31');
		expect(document.activeElement).toBe(year);

		typeKey('2');
		typeKey('0');
		typeKey('2');
		typeKey('6');
		expect(year.textContent).toBe('2026');

		const valueOutput = target.querySelector('[data-testid="value-output"]') as HTMLOutputElement;
		const hiddenInput = target.querySelector('input[name="date"]') as HTMLInputElement;

		expect(valueOutput.textContent).toBe('2026-12-31');
		expect(hiddenInput.value).toBe('2026-12-31');
	});
});
