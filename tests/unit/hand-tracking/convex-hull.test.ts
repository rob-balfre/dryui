import { describe, expect, it } from 'bun:test';
import {
	convexHull,
	convexityDefects
} from '../../../packages/hand-tracking/src/pipeline/convex-hull.js';

describe('convex hull', () => {
	it('returns the hull for a textbook point set', () => {
		const hull = convexHull([
			{ x: 0, y: 0 },
			{ x: 2, y: 0 },
			{ x: 2, y: 2 },
			{ x: 0, y: 2 },
			{ x: 1, y: 1 }
		]);

		expect(hull).toHaveLength(4);
		expect(hull).toEqual([
			{ x: 0, y: 0 },
			{ x: 2, y: 0 },
			{ x: 2, y: 2 },
			{ x: 0, y: 2 }
		]);
	});

	it('detects concavity as a convexity defect', () => {
		const contour = [
			{ x: 0, y: 0 },
			{ x: 3, y: 0 },
			{ x: 3, y: 3 },
			{ x: 2, y: 1 },
			{ x: 0, y: 3 }
		];
		const hull = convexHull(contour);
		const defects = convexityDefects(contour, hull);

		expect(defects.length).toBeGreaterThan(0);
		const first = defects[0];
		if (!first) throw new Error('Expected convexity defect');
		expect(first.depth).toBeGreaterThan(0.5);
	});
});
