import type { GestureEvent, GestureType, Point3D } from '../types.js';

export interface GestureMetrics {
	fingerCount: number;
	thumbIndexDistance: number;
	thumbPinkyDistance: number;
	palmVelocity: number;
	movementDistance: number;
	stationaryMs: number;
	handCount: number;
	handSeparation: number;
	selected: boolean;
}

export interface GestureClassifierOptions {
	pinchDistance?: number;
	dragVelocity?: number;
	resizeDelta?: number;
	swipeDistance?: number;
	openPalmHoldMs?: number;
	pointFingerCount?: number;
}

export interface GestureState {
	active: GestureType | null;
	candidate: GestureType | null;
	enterCount: number;
	exitCount: number;
}

const DEFAULT_OPTIONS: Required<GestureClassifierOptions> = {
	pinchDistance: 0.06,
	dragVelocity: 0.02,
	resizeDelta: 0.15,
	swipeDistance: 0.3,
	openPalmHoldMs: 300,
	pointFingerCount: 1
};

export function classifyGesture(
	metrics: GestureMetrics,
	options: GestureClassifierOptions = {}
): GestureType | null {
	const config = { ...DEFAULT_OPTIONS, ...options };

	if (metrics.handCount >= 2 && metrics.selected && metrics.handSeparation > config.resizeDelta) {
		return 'two-hand-pinch';
	}

	if (metrics.fingerCount === 0) {
		return 'fist';
	}

	if (metrics.fingerCount >= 5 && metrics.stationaryMs >= config.openPalmHoldMs) {
		return 'open-palm';
	}

	if (metrics.fingerCount === config.pointFingerCount) {
		return 'point';
	}

	if (metrics.thumbIndexDistance <= config.pinchDistance) {
		return metrics.palmVelocity > config.dragVelocity ? 'drag' : 'pinch';
	}

	if (metrics.thumbPinkyDistance >= config.resizeDelta && metrics.selected) {
		return 'resize';
	}

	if (metrics.movementDistance >= config.swipeDistance) {
		return 'swipe';
	}

	if (metrics.fingerCount >= 3) {
		return 'hover';
	}

	return null;
}

export function createGestureFSM(
	options: GestureClassifierOptions & {
		enterFrames?: number;
		exitFrames?: number;
	} = {}
): {
	readonly state: GestureState;
	update: (metrics: GestureMetrics, cursor?: Point3D | null) => GestureEvent | null;
	reset: () => void;
} {
	const config = {
		...DEFAULT_OPTIONS,
		...options,
		enterFrames: options.enterFrames ?? 3,
		exitFrames: options.exitFrames ?? 5
	};

	const state: GestureState = {
		active: null,
		candidate: null,
		enterCount: 0,
		exitCount: 0
	};

	function reset(): void {
		state.active = null;
		state.candidate = null;
		state.enterCount = 0;
		state.exitCount = 0;
	}

	function update(metrics: GestureMetrics, cursor: Point3D | null = null): GestureEvent | null {
		const next = classifyGesture(metrics, config);

		if (next === state.active) {
			state.candidate = null;
			state.enterCount = 0;
			state.exitCount = 0;
			return next
				? {
						type: next,
						handId: null,
						handIndex: 0,
						confidence: 1,
						cursor,
						details: {
							fingerCount: metrics.fingerCount,
							selected: metrics.selected
						}
					}
				: null;
		}

		if (next === state.candidate) {
			state.enterCount += 1;
		} else {
			state.candidate = next;
			state.enterCount = next ? 1 : 0;
			state.exitCount = 0;
		}

		if (!state.active && state.candidate && state.enterCount >= config.enterFrames) {
			state.active = state.candidate;
			state.candidate = null;
			state.enterCount = 0;
			return state.active
				? {
						type: state.active,
						handId: null,
						handIndex: 0,
						confidence: 1,
						cursor,
						details: {
							fingerCount: metrics.fingerCount,
							selected: metrics.selected
						}
					}
				: null;
		}

		if (state.active && next !== state.active) {
			state.exitCount += 1;
			if (state.exitCount >= config.exitFrames) {
				state.active = next;
				state.candidate = next;
				state.enterCount = next ? 1 : 0;
				state.exitCount = 0;
			}
		}

		return state.active
			? {
					type: state.active,
					handId: null,
					handIndex: 0,
					confidence: 1,
					cursor,
					details: {
						fingerCount: metrics.fingerCount,
						selected: metrics.selected
					}
				}
			: null;
	}

	return { state, update, reset };
}
