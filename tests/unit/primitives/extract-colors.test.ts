import { afterEach, describe, expect, mock, test } from 'bun:test';
import { extractColorsFromImage } from '../../../packages/primitives/src/color-picker/extract-colors';

const originalDocument = globalThis.document;
const originalImage = globalThis.Image;
const originalCreateObjectURL = globalThis.URL.createObjectURL;

interface ImageTestContext {
	canvas: HTMLCanvasElement;
	drawImage: ReturnType<typeof mock>;
	getContext: ReturnType<typeof mock>;
	objectUrlCalls: Blob[];
}

function installImageTestContext(
	pixels: number[],
	options: {
		fail?: boolean;
	} = {}
): ImageTestContext {
	const drawImage = mock(() => {});
	const getImageData = mock(() => ({
		data: Uint8ClampedArray.from(pixels)
	}));
	const getContext = mock(() => ({
		drawImage,
		getImageData
	}));
	const canvas = {
		width: 0,
		height: 0,
		getContext
	} as unknown as HTMLCanvasElement;

	(globalThis as typeof globalThis & { document?: Document }).document = {
		createElement(tagName: string) {
			if (tagName !== 'canvas') {
				throw new Error(`Unexpected element request: ${tagName}`);
			}

			return canvas;
		}
	} as Document;

	const objectUrlCalls: Blob[] = [];
	Object.defineProperty(globalThis.URL, 'createObjectURL', {
		value(file: Blob) {
			objectUrlCalls.push(file);
			return 'blob:test-image';
		},
		configurable: true
	});

	class MockImage {
		onload: ((event: Event) => void) | null = null;
		onerror: ((error: unknown) => void) | null = null;

		set src(_value: string) {
			queueMicrotask(() => {
				if (options.fail) {
					this.onerror?.(new Error('load failed'));
					return;
				}

				this.onload?.(new Event('load'));
			});
		}
	}

	(globalThis as typeof globalThis & { Image?: typeof Image }).Image =
		MockImage as unknown as typeof Image;

	return {
		canvas,
		drawImage,
		getContext,
		objectUrlCalls
	};
}

afterEach(() => {
	if (originalDocument) {
		(globalThis as typeof globalThis & { document?: Document }).document = originalDocument;
	} else {
		delete (globalThis as typeof globalThis & { document?: Document }).document;
	}

	if (originalImage) {
		(globalThis as typeof globalThis & { Image?: typeof Image }).Image = originalImage;
	} else {
		delete (globalThis as typeof globalThis & { Image?: typeof Image }).Image;
	}

	Object.defineProperty(globalThis.URL, 'createObjectURL', {
		value: originalCreateObjectURL,
		configurable: true
	});
});

describe('extractColorsFromImage', () => {
	test('returns dominant colors in descending bucket order and respects the count limit', async () => {
		const { canvas, drawImage, getContext, objectUrlCalls } = installImageTestContext([
			230, 0, 0, 255, 230, 0, 0, 255, 230, 0, 0, 255, 0, 230, 0, 255, 0, 230, 0, 255, 0, 0, 230,
			255, 127, 127, 127, 255, 0, 0, 0, 255, 255, 255, 255, 255
		]);
		const file = new File(['pixel-data'], 'palette.png', { type: 'image/png' });

		const colors = await extractColorsFromImage(file, 2);

		expect(colors).toEqual(['#e60000', '#00e600']);
		expect(canvas.width).toBe(64);
		expect(canvas.height).toBe(64);
		expect(getContext).toHaveBeenCalledWith('2d');
		expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 64, 64);
		expect(objectUrlCalls).toEqual([file]);
	});

	test('filters grayscale, near-black, and near-white pixels out of the result', async () => {
		installImageTestContext([128, 128, 128, 255, 20, 20, 20, 255, 250, 250, 250, 255]);
		const file = new File(['neutral-data'], 'neutral.png', { type: 'image/png' });

		await expect(extractColorsFromImage(file)).resolves.toEqual([]);
	});

	test('rejects when the source image fails to load', async () => {
		installImageTestContext([], { fail: true });
		const file = new File(['broken'], 'broken.png', { type: 'image/png' });

		await expect(extractColorsFromImage(file)).rejects.toThrow('load failed');
	});
});
