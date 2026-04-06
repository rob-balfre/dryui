import { describe, expect, test } from 'bun:test';
import {
	computeSectionSnap,
	computeSnap,
	createRectFromPoint,
	dedupeRects,
	isMeaningfulDrag
} from '../../../../packages/feedback/src/layout-mode';
import type {
	DesignPlacement,
	DetectedSection
} from '../../../../packages/feedback/src/layout-mode';

describe('layout-mode geometry', () => {
	test('createRectFromPoint normalizes drag direction', () => {
		expect(createRectFromPoint({ x: 80, y: 120 }, { x: 20, y: 40 })).toEqual({
			x: 20,
			y: 40,
			width: 60,
			height: 80
		});
	});

	test('isMeaningfulDrag uses the minimum size threshold', () => {
		expect(isMeaningfulDrag({ x: 0, y: 0, width: 10, height: 10 })).toBe(false);
		expect(isMeaningfulDrag({ x: 0, y: 0, width: 24, height: 24 })).toBe(true);
	});

	test('dedupeRects removes identical rectangles', () => {
		expect(
			dedupeRects([
				{ x: 1, y: 2, width: 3, height: 4 },
				{ x: 1, y: 2, width: 3, height: 4 },
				{ x: 5, y: 6, width: 7, height: 8 }
			])
		).toEqual([
			{ x: 1, y: 2, width: 3, height: 4 },
			{ x: 5, y: 6, width: 7, height: 8 }
		]);
	});

	test('computeSnap snaps to nearby placements', () => {
		const placements: DesignPlacement[] = [
			{
				id: 'a',
				type: 'card',
				x: 100,
				y: 100,
				width: 200,
				height: 120,
				scrollY: 0,
				timestamp: 1
			}
		];

		const snap = computeSnap(
			{ x: 299, y: 100, width: 80, height: 40 },
			placements,
			new Set<string>()
		);

		expect(snap.dx).toBe(1);
	});

	test('computeSectionSnap snaps using section rects', () => {
		const sections: DetectedSection[] = [
			{
				id: 's1',
				label: 'Header',
				tagName: 'header',
				selector: 'header',
				role: 'banner',
				className: null,
				textSnippet: null,
				originalRect: { x: 0, y: 0, width: 800, height: 80 },
				currentRect: { x: 0, y: 0, width: 800, height: 80 },
				originalIndex: 0
			}
		];

		const snap = computeSectionSnap(
			{ x: 1, y: 81, width: 100, height: 40 },
			sections,
			new Set<string>()
		);
		expect(snap.dy).toBe(-1);
	});
});
