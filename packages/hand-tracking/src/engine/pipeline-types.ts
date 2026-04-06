import type { CalibrationProfile, GestureEvent, HandLandmarks, Point3D } from '../types.js';
import type { HandGeometry } from '../pipeline/hand-geometry.js';
import type { createGestureFSM } from '../pipeline/gesture.js';

export interface PipelineInput {
	rgba: ArrayLike<number>;
	width: number;
	height: number;
	timestamp?: number;
}

export interface PipelineResult {
	mask: Uint8Array;
	hands: HandLandmarks[];
	geometry: HandGeometry[];
	gesture: GestureEvent | null;
	cursor: Point3D | null;
	fps: number;
	yThreshold: number;
	skinRatio: number;
	debug: {
		contourCount: number;
		candidateCount: number;
		largestContourRatio: number;
		bestCandidateScore: number;
		engine?: 'legacy' | 'mediapipe';
		initializing?: boolean;
		message?: string;
	};
}

export interface MediaPipePipelineOptions {
	wasmBaseUrl?: string;
	modelAssetPath?: string;
	delegate?: 'CPU' | 'GPU';
	numHands?: number;
	minHandDetectionConfidence?: number;
	minHandPresenceConfidence?: number;
	minTrackingConfidence?: number;
	fallbackToLegacyOnError?: boolean;
}

export interface PipelineRunnerOptions {
	calibration?: CalibrationProfile | null;
	budgetRadius?: number;
	engine?: 'auto' | 'legacy' | 'mediapipe';
	mediapipe?: MediaPipePipelineOptions;
}

export interface PipelineRunner {
	run: (input: PipelineInput) => PipelineResult;
	readonly gestureState: ReturnType<typeof createGestureFSM>['state'];
}
