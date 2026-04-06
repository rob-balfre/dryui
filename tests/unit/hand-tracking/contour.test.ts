import { describe, expect, it } from 'bun:test';
import { extractContours } from '../../../packages/hand-tracking/src/pipeline/contour.js';

describe('contour extraction', () => {
	it('reduces a rectangle to four corners', () => {
		const mask = new Uint8Array([0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0]);

		const contours = extractContours(mask, 5, 4);

		expect(contours).toHaveLength(1);
		const first = contours[0];
		if (!first) throw new Error('Expected contour');
		expect(first.points).toHaveLength(4);
		expect(new Set(first.points.map((point) => `${point.x},${point.y}`))).toEqual(
			new Set(['1,1', '3,1', '3,2', '1,2'])
		);
	});
});
