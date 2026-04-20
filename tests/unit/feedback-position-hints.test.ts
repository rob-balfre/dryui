import { describe, expect, test } from 'bun:test';
import {
	cornerFor,
	describeElement,
	describePosition,
	percentFor
} from '../../packages/feedback/src/position-hints.ts';

describe('cornerFor', () => {
	test('classifies the four corners', () => {
		expect(cornerFor(10, 10, 1000, 800)).toBe('top-left');
		expect(cornerFor(990, 10, 1000, 800)).toBe('top-right');
		expect(cornerFor(10, 790, 1000, 800)).toBe('bottom-left');
		expect(cornerFor(990, 790, 1000, 800)).toBe('bottom-right');
	});

	test('centers of the viewport resolve to "center"', () => {
		expect(cornerFor(500, 400, 1000, 800)).toBe('center');
	});

	test('points near the axis mid but outside the center band pick the right corner', () => {
		// 36% across and 10% down -> upper-left quadrant, outside center band on y.
		expect(cornerFor(360, 80, 1000, 800)).toBe('top-left');
		// 64% across and 90% down -> lower-right quadrant.
		expect(cornerFor(640, 720, 1000, 800)).toBe('bottom-right');
	});

	test('falls back to center when viewport has no area', () => {
		expect(cornerFor(100, 100, 0, 800)).toBe('center');
		expect(cornerFor(100, 100, 1000, 0)).toBe('center');
	});
});

describe('percentFor', () => {
	test('returns percentages capped to 0-100 and rounded to 2 decimals', () => {
		expect(percentFor(250, 100, 1000, 800)).toEqual({ percentX: 25, percentY: 12.5 });
		expect(percentFor(0, 0, 1000, 800)).toEqual({ percentX: 0, percentY: 0 });
		expect(percentFor(1000, 800, 1000, 800)).toEqual({ percentX: 100, percentY: 100 });
	});

	test('clamps negative and overflowing coordinates', () => {
		expect(percentFor(-50, 1200, 1000, 800)).toEqual({ percentX: 0, percentY: 100 });
		expect(percentFor(9999, -1, 1000, 800)).toEqual({ percentX: 100, percentY: 0 });
	});

	test('returns zeros when viewport dimensions are non-positive', () => {
		expect(percentFor(100, 100, 0, 800)).toEqual({ percentX: 0, percentY: 0 });
		expect(percentFor(100, 100, 1000, -1)).toEqual({ percentX: 0, percentY: 0 });
	});
});

describe('describePosition', () => {
	test('combines corner and percent for the reported 2475x59 in 2560x1440 case', () => {
		// This is the exact case from the task background: a text annotation in
		// the top-right corner of a wide viewport.
		const result = describePosition(2475, 59, 2560, 1440);
		expect(result.corner).toBe('top-right');
		expect(result.percentX).toBeCloseTo(96.68, 1);
		expect(result.percentY).toBeCloseTo(4.1, 1);
	});
});

describe('describeElement', () => {
	test('returns undefined when no element is provided', () => {
		expect(describeElement(null)).toBeUndefined();
		expect(describeElement(undefined)).toBeUndefined();
	});

	test('reads tag, id, and up to two classes into a single selector', () => {
		const el = {
			tagName: 'BUTTON',
			getAttribute(name: string): string | null {
				if (name === 'id') return 'submit-btn';
				if (name === 'class') return 'btn btn-primary btn-lg extra';
				return null;
			}
		} as unknown as Element;

		const descriptor = describeElement(el);
		expect(descriptor).toEqual({
			tag: 'button',
			id: 'submit-btn',
			selector: 'button#submit-btn.btn.btn-primary'
		});
	});

	test('falls back to the bare tag when there is no id or class', () => {
		const el = {
			tagName: 'ARTICLE',
			getAttribute: () => null
		} as unknown as Element;

		expect(describeElement(el)).toEqual({ tag: 'article' });
	});

	test('ignores whitespace-only ids and class attributes', () => {
		const el = {
			tagName: 'DIV',
			getAttribute(name: string): string | null {
				if (name === 'id') return '   ';
				if (name === 'class') return '   ';
				return null;
			}
		} as unknown as Element;

		expect(describeElement(el)).toEqual({ tag: 'div' });
	});
});
