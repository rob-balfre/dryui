import { afterEach, describe, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import FileSelectHarness from './fixtures/file-select-harness.svelte';

describe('FileSelect', () => {
	let cleanup: (() => void) | undefined;

	afterEach(() => {
		cleanup?.();
		cleanup = undefined;
	});

	function setup() {
		const target = document.createElement('div');
		document.body.appendChild(target);
		const instance = mount(FileSelectHarness, { target });
		cleanup = () => {
			unmount(instance);
			target.remove();
		};
		return target;
	}

	it('renders trigger and placeholder value', () => {
		const target = setup();
		const trigger = target.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
		const value = target.querySelector('[data-testid="value"]') as HTMLSpanElement;

		expect(trigger).toBeTruthy();
		expect(trigger.textContent).toContain('Choose folder');
		expect(value.textContent).toContain('No folder selected');
		expect(value.dataset['placeholder']).toBeDefined();
	});

	it('calls onrequest and updates value on trigger click', async () => {
		const target = setup();
		const trigger = target.querySelector('[data-testid="trigger"]') as HTMLButtonElement;

		trigger.click();
		await new Promise((r) => setTimeout(r, 10));
		flushSync();

		const valueOutput = target.querySelector('[data-testid="value-output"]') as HTMLElement;
		expect(valueOutput.textContent).toBe('/Users/test/project');

		const requestCount = target.querySelector('[data-testid="request-count"]') as HTMLElement;
		expect(requestCount.textContent).toBe('1');
	});

	it('does not show clear button when no value', () => {
		const target = setup();
		const clear = target.querySelector('[data-testid="clear"]');
		expect(clear).toBeNull();
	});

	it('shows clear button after selection and clears on click', async () => {
		const target = setup();
		const trigger = target.querySelector('[data-testid="trigger"]') as HTMLButtonElement;

		trigger.click();
		await new Promise((r) => setTimeout(r, 10));
		flushSync();

		const clear = target.querySelector('[data-testid="clear"]') as HTMLButtonElement;
		expect(clear).toBeTruthy();

		clear.click();
		flushSync();

		const valueOutput = target.querySelector('[data-testid="value-output"]') as HTMLElement;
		expect(valueOutput.textContent).toBe('null');
	});

	it('does not call onrequest when disabled', async () => {
		const target = setup();

		const toggleDisabled = target.querySelector(
			'[data-testid="set-disabled"]'
		) as HTMLButtonElement;
		toggleDisabled.click();
		flushSync();

		const trigger = target.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
		expect(trigger.disabled).toBe(true);

		trigger.click();
		await new Promise((r) => setTimeout(r, 10));
		flushSync();

		const requestCount = target.querySelector('[data-testid="request-count"]') as HTMLElement;
		expect(requestCount.textContent).toBe('0');
	});

	it('does not update value when onrequest returns null', async () => {
		const target = setup();

		const setNull = target.querySelector('[data-testid="set-null-result"]') as HTMLButtonElement;
		setNull.click();
		flushSync();

		const trigger = target.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
		trigger.click();
		await new Promise((r) => setTimeout(r, 10));
		flushSync();

		const valueOutput = target.querySelector('[data-testid="value-output"]') as HTMLElement;
		expect(valueOutput.textContent).toBe('null');
	});
});
