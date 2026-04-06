import { describe, expect, it } from 'bun:test';
import { segmentSkinMask } from '../../../packages/hand-tracking/src/pipeline/skin-segmentation.js';

function createRgba(
	width: number,
	height: number,
	pixels: Array<[number, number, number, number]>
): Uint8ClampedArray {
	const data = new Uint8ClampedArray(width * height * 4);

	pixels.forEach(([r, g, b, a], index) => {
		const offset = index * 4;
		data[offset] = r;
		data[offset + 1] = g;
		data[offset + 2] = b;
		data[offset + 3] = a;
	});

	return data;
}

describe('skin segmentation', () => {
	it('detects a skin-toned pixel and rejects a dark background', () => {
		const rgba = createRgba(2, 2, [
			[198, 140, 90, 255],
			[12, 12, 12, 255],
			[198, 140, 90, 255],
			[255, 255, 255, 255]
		]);

		const mask = segmentSkinMask(rgba, 2, 2);

		expect(Array.from(mask)).toEqual([1, 0, 1, 0]);
	});

	it('keeps a warm low-light skin tone without calibration', () => {
		const rgba = createRgba(2, 1, [
			[104, 72, 54, 255],
			[210, 220, 235, 255]
		]);

		const mask = segmentSkinMask(rgba, 2, 1);

		expect(Array.from(mask)).toEqual([1, 0]);
	});

	it('rejects beige wall tones that are close to skin in ycbcr', () => {
		const rgba = createRgba(2, 1, [
			[220, 205, 185, 255],
			[236, 208, 184, 255]
		]);

		const mask = segmentSkinMask(rgba, 2, 1);

		expect(Array.from(mask)).toEqual([0, 1]);
	});
});
