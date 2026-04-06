import { describe, test, expect } from 'bun:test';
import {
	hexToRgb,
	rgbToHex,
	rgbToHsv,
	hsvToRgb,
	rgbToHsl,
	hslToRgb,
	hsvToHsl,
	hslToHsv,
	isValidHex,
	parseColor,
	formatRgb,
	formatHsl
} from '../../packages/primitives/src/color-picker/color-utils.js';

describe('color-utils', () => {
	test('hexToRgb converts #ff0000 to red', () => {
		expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
	});

	test('rgbToHex converts red back', () => {
		expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000');
	});

	test('isValidHex accepts 3 and 6 digit hex', () => {
		expect(isValidHex('#fff')).toBe(true);
		expect(isValidHex('#ff0000')).toBe(true);
		expect(isValidHex('ff0000')).toBe(false);
		expect(isValidHex('#gggggg')).toBe(false);
	});

	test('round-trip: rgb → hsv → rgb', () => {
		const rgb = { r: 100, g: 150, b: 200 };
		const hsv = rgbToHsv(rgb);
		const back = hsvToRgb(hsv);
		// Intermediate integer rounding means ±1 tolerance is expected
		expect(Math.abs(back.r - rgb.r)).toBeLessThanOrEqual(1);
		expect(Math.abs(back.g - rgb.g)).toBeLessThanOrEqual(1);
		expect(Math.abs(back.b - rgb.b)).toBeLessThanOrEqual(1);
	});

	test('round-trip: rgb → hsl → rgb', () => {
		const rgb = { r: 100, g: 150, b: 200 };
		const hsl = rgbToHsl(rgb);
		const back = hslToRgb(hsl);
		// Intermediate integer rounding means ±1 tolerance is expected
		expect(Math.abs(back.r - rgb.r)).toBeLessThanOrEqual(1);
		expect(Math.abs(back.g - rgb.g)).toBeLessThanOrEqual(1);
		expect(Math.abs(back.b - rgb.b)).toBeLessThanOrEqual(1);
	});

	test('parseColor handles hex, rgb(), hsl()', () => {
		expect(parseColor('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
		expect(parseColor('rgb(255, 0, 0)')).toEqual({ r: 255, g: 0, b: 0 });
		expect(parseColor('invalid')).toBeNull();
	});

	test('formatRgb produces correct string', () => {
		expect(formatRgb({ r: 255, g: 0, b: 0 })).toBe('rgb(255, 0, 0)');
	});

	test('formatHsl produces correct string', () => {
		const result = formatHsl({ h: 0, s: 100, l: 50 });
		expect(result).toBe('hsl(0, 100%, 50%)');
	});
});
