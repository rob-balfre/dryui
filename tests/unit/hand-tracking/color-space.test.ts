import { describe, expect, it } from 'bun:test';
import {
	rgbToYCbCr,
	ycbcrToRgb
} from '../../../packages/hand-tracking/src/pipeline/color-space.js';

describe('color-space', () => {
	it('converts pure red to expected ycbcr values', () => {
		expect(rgbToYCbCr({ r: 255, g: 0, b: 0 })).toEqual({
			y: 76,
			cb: 85,
			cr: 255
		});
	});

	it('round-trips a neutral gray within a tight tolerance', () => {
		const ycbcr = rgbToYCbCr({ r: 128, g: 128, b: 128 });
		const rgb = ycbcrToRgb(ycbcr);

		expect(rgb.r).toBeGreaterThanOrEqual(127);
		expect(rgb.r).toBeLessThanOrEqual(129);
		expect(rgb.g).toBeGreaterThanOrEqual(127);
		expect(rgb.g).toBeLessThanOrEqual(129);
		expect(rgb.b).toBeGreaterThanOrEqual(127);
		expect(rgb.b).toBeLessThanOrEqual(129);
	});
});
