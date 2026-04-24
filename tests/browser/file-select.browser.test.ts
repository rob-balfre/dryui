import { describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import FileSelectHarness from './fixtures/file-select-harness.svelte';
import { render } from './_harness';

describe('FileSelect', () => {
	function setup(props?: { useRequest?: boolean; directory?: boolean }) {
		return render(FileSelectHarness, props).target;
	}

	function getPickerDescriptor() {
		return Object.getOwnPropertyDescriptor(window, 'showDirectoryPicker');
	}

	function setDirectoryPicker(value: unknown) {
		Object.defineProperty(window, 'showDirectoryPicker', {
			value,
			configurable: true
		});
	}

	function restoreDirectoryPicker(descriptor: PropertyDescriptor | undefined) {
		if (descriptor) {
			Object.defineProperty(window, 'showDirectoryPicker', descriptor);
		} else {
			Reflect.deleteProperty(window, 'showDirectoryPicker');
		}
	}

	function setFiles(input: HTMLInputElement, files: File[]) {
		const transfer = new DataTransfer();
		for (const file of files) {
			transfer.items.add(file);
		}
		input.files = transfer.files;
	}

	function createFile(name: string, relativePath = '') {
		const file = new File(['fixture'], name, { type: 'text/plain' });
		Object.defineProperty(file, 'webkitRelativePath', {
			value: relativePath,
			configurable: true
		});

		return file;
	}

	async function flushAsync() {
		await new Promise((resolve) => setTimeout(resolve, 10));
		flushSync();
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
		await flushAsync();

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
		await flushAsync();

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
		await flushAsync();

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
		await flushAsync();

		const valueOutput = target.querySelector('[data-testid="value-output"]') as HTMLElement;
		expect(valueOutput.textContent).toBe('null');
	});

	it('uses showDirectoryPicker when File System Access is available', async () => {
		const descriptor = getPickerDescriptor();
		const showDirectoryPicker = vi.fn(async () => ({ name: 'picker-project' }));

		try {
			setDirectoryPicker(showDirectoryPicker);

			const target = setup({ useRequest: false });
			const trigger = target.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
			const input = target.querySelector('input[type="file"]') as HTMLInputElement;
			const inputClick = vi.spyOn(input, 'click').mockImplementation(() => {});

			trigger.click();
			await flushAsync();

			const valueOutput = target.querySelector('[data-testid="value-output"]') as HTMLElement;
			expect(valueOutput.textContent).toBe('picker-project');
			expect(showDirectoryPicker).toHaveBeenCalledWith({ mode: 'read' });
			expect(inputClick).not.toHaveBeenCalled();
		} finally {
			restoreDirectoryPicker(descriptor);
		}
	});

	it('falls back to native file input when File System Access is unavailable', async () => {
		const descriptor = getPickerDescriptor();

		try {
			setDirectoryPicker(undefined);

			const target = setup({ useRequest: false });
			const trigger = target.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
			const input = target.querySelector('input[type="file"]') as HTMLInputElement;
			const inputClick = vi.spyOn(input, 'click').mockImplementation(() => {});

			trigger.click();
			await flushAsync();

			expect(inputClick).toHaveBeenCalledOnce();
			expect(input.hasAttribute('webkitdirectory')).toBe(true);

			setFiles(input, [createFile('package.json', 'fallback-project/package.json')]);
			input.dispatchEvent(new Event('change', { bubbles: true }));
			flushSync();

			const valueOutput = target.querySelector('[data-testid="value-output"]') as HTMLElement;
			expect(valueOutput.textContent).toBe('fallback-project');
		} finally {
			restoreDirectoryPicker(descriptor);
		}
	});

	it('falls back to native file input when File System Access fails', async () => {
		const descriptor = getPickerDescriptor();
		const showDirectoryPicker = vi.fn(async () => {
			throw new DOMException('Blocked', 'SecurityError');
		});

		try {
			setDirectoryPicker(showDirectoryPicker);

			const target = setup({ useRequest: false });
			const trigger = target.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
			const input = target.querySelector('input[type="file"]') as HTMLInputElement;
			const inputClick = vi.spyOn(input, 'click').mockImplementation(() => {});

			trigger.click();
			await flushAsync();

			expect(showDirectoryPicker).toHaveBeenCalledWith({ mode: 'read' });
			expect(inputClick).toHaveBeenCalledOnce();
			expect(input.hasAttribute('webkitdirectory')).toBe(true);

			setFiles(input, [createFile('certificate.pem', 'blocked-project/certificate.pem')]);
			input.dispatchEvent(new Event('change', { bubbles: true }));
			flushSync();

			const valueOutput = target.querySelector('[data-testid="value-output"]') as HTMLElement;
			expect(valueOutput.textContent).toBe('blocked-project');
		} finally {
			restoreDirectoryPicker(descriptor);
		}
	});
});
