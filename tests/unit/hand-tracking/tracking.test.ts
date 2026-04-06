import { describe, expect, it } from 'bun:test';
import { assignTrackedHands } from '../../../packages/hand-tracking/src/pipeline/tracking.js';

describe('hand tracking', () => {
	it('preserves hand identity across nearby frames', () => {
		const previous = [
			{
				id: 'hand-1',
				points: [],
				handedness: 'left' as const,
				confidence: 1,
				boundingBox: { x: 10, y: 10, width: 20, height: 20 },
				centroid: { x: 20, y: 20, z: 0 },
				palmCenter: { x: 20, y: 20, z: 0 },
				wrist: { x: 20, y: 30, z: 0 }
			}
		];

		const current = [
			{
				id: 'current',
				points: [],
				handedness: 'left' as const,
				confidence: 1,
				boundingBox: { x: 12, y: 12, width: 20, height: 20 },
				centroid: { x: 21, y: 21, z: 0 },
				palmCenter: { x: 21, y: 21, z: 0 },
				wrist: { x: 21, y: 31, z: 0 }
			}
		];

		const tracked = assignTrackedHands(previous, current);

		const first = tracked[0];
		if (!first) throw new Error('Expected tracked hand');
		expect(first.id).toBe('hand-1');
		expect(first.previousId).toBe('hand-1');
		expect(first.trackingScore).toBeGreaterThan(0);
	});
});
