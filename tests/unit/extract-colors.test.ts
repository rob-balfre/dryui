import { describe, test, expect } from 'bun:test';
import { extractColorsFromImage } from '../../packages/primitives/src/color-picker/extract-colors';

describe('extractColorsFromImage', () => {
	test('is exported as a function', () => {
		expect(typeof extractColorsFromImage).toBe('function');
	});
});
