import { describe, expect, it } from 'bun:test';
import { analyzeHandContour } from '../../../packages/hand-tracking/src/pipeline/hand-geometry.js';
import type { Contour } from '../../../packages/hand-tracking/src/pipeline/contour.js';

function makeStarContour(): Contour {
	const points = [
		{ x: 50, y: 10 },
		{ x: 60, y: 25 },
		{ x: 80, y: 20 },
		{ x: 68, y: 35 },
		{ x: 85, y: 55 },
		{ x: 62, y: 50 },
		{ x: 50, y: 75 },
		{ x: 38, y: 50 },
		{ x: 15, y: 55 },
		{ x: 32, y: 35 },
		{ x: 20, y: 20 },
		{ x: 40, y: 25 }
	];

	return {
		points,
		area: 0,
		centroid: { x: 50, y: 35 },
		bounds: { x: 15, y: 10, width: 70, height: 66 },
		pixelCount: points.length
	};
}

describe('hand geometry', () => {
	it('finds five fingertips in a synthetic hand contour', () => {
		const geometry = analyzeHandContour(makeStarContour());

		expect(geometry.fingertips).toHaveLength(5);
		expect(geometry.skeleton).toHaveLength(21);
		expect(geometry.palmCenter).toEqual({ x: 50, y: 35, z: 0 });
	});
});
