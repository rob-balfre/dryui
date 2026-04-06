import { describe, expect, test } from 'bun:test';
import {
	getPopupPosition,
	hasMeaningfulArea,
	intersectsRect,
	normalizeText,
	rectFromPoints,
	toRect,
	unionRects,
	uniqueLabels
} from '../../../packages/feedback/src/utils/selection';

describe('normalizeText', () => {
	test('collapses whitespace and trims the result', () => {
		expect(normalizeText('  Hello   world \n again  ')).toBe('Hello world again');
	});
});

describe('toRect', () => {
	test('copies the rect-like shape into a plain rect', () => {
		expect(toRect({ x: 12, y: 24, width: 48, height: 96 })).toEqual({
			x: 12,
			y: 24,
			width: 48,
			height: 96
		});
	});
});

describe('rectFromPoints', () => {
	test('normalizes drag direction into a positive rectangle', () => {
		expect(rectFromPoints({ x: 80, y: 120 }, { x: 20, y: 40 })).toEqual({
			x: 20,
			y: 40,
			width: 60,
			height: 80
		});
	});
});

describe('hasMeaningfulArea', () => {
	test('uses the threshold against either dimension', () => {
		expect(hasMeaningfulArea({ x: 0, y: 0, width: 7, height: 7 }, 8)).toBe(false);
		expect(hasMeaningfulArea({ x: 0, y: 0, width: 8, height: 1 }, 8)).toBe(true);
		expect(hasMeaningfulArea({ x: 0, y: 0, width: 1, height: 9 }, 8)).toBe(true);
	});
});

describe('unionRects', () => {
	test('returns null when there are no rectangles', () => {
		expect(unionRects([])).toBeNull();
	});

	test('builds a bounding rectangle across multiple targets', () => {
		expect(
			unionRects([
				{ x: 20, y: 40, width: 50, height: 60 },
				{ x: 90, y: 15, width: 30, height: 25 },
				{ x: 12, y: 55, width: 18, height: 18 }
			])
		).toEqual({
			x: 12,
			y: 15,
			width: 108,
			height: 85
		});
	});
});

describe('intersectsRect', () => {
	test('returns true when rectangles overlap', () => {
		expect(
			intersectsRect(
				{ x: 10, y: 10, width: 40, height: 40 },
				{ x: 30, y: 30, width: 20, height: 20 }
			)
		).toBe(true);
	});

	test('returns false when rectangles only touch edges', () => {
		expect(
			intersectsRect(
				{ x: 10, y: 10, width: 20, height: 20 },
				{ x: 30, y: 10, width: 20, height: 20 }
			)
		).toBe(false);
	});
});

describe('getPopupPosition', () => {
	test('pins the popup inside the viewport width and top padding', () => {
		expect(getPopupPosition({ x: 520, y: 4, width: 40, height: 20 }, 640, 340)).toEqual({
			x: 300,
			y: 16
		});
	});
});

describe('uniqueLabels', () => {
	test('deduplicates labels while preserving order and dropping empties', () => {
		expect(uniqueLabels(['button', '', 'card', 'button', 'input', 'card'])).toEqual([
			'button',
			'card',
			'input'
		]);
	});
});
