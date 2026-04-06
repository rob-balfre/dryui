import { describe, expect, it } from 'bun:test';
import {
	classifyGesture,
	createGestureFSM
} from '../../../packages/hand-tracking/src/pipeline/gesture.js';

describe('gesture state machine', () => {
	it('classifies a pinch and keeps it stable with hysteresis', () => {
		expect(
			classifyGesture({
				fingerCount: 2,
				thumbIndexDistance: 0.02,
				thumbPinkyDistance: 0.12,
				palmVelocity: 0.01,
				movementDistance: 0.02,
				stationaryMs: 0,
				handCount: 1,
				handSeparation: 0,
				selected: false
			})
		).toBe('pinch');

		const fsm = createGestureFSM({ enterFrames: 2, exitFrames: 3 });
		const metrics = {
			fingerCount: 2,
			thumbIndexDistance: 0.02,
			thumbPinkyDistance: 0.12,
			palmVelocity: 0.01,
			movementDistance: 0.02,
			stationaryMs: 0,
			handCount: 1,
			handSeparation: 0,
			selected: false
		};

		expect(fsm.update(metrics)).toBeNull();
		expect(fsm.update(metrics)?.type).toBe('pinch');

		const relaxed = {
			...metrics,
			fingerCount: 5,
			thumbIndexDistance: 0.4,
			stationaryMs: 500
		};

		expect(fsm.update(relaxed)?.type).toBe('pinch');
		expect(fsm.update(relaxed)?.type).toBe('pinch');
		expect(fsm.update(relaxed)?.type).toBe('open-palm');
	});
});
