import { createContext } from 'svelte';
import type { CalibrationProfile, GestureEvent, HandLandmarks, Point3D } from './types.js';
import { createFrameLoop, type FrameLoop } from './engine/frame-loop.js';
import {
	createMediaPipeHandTracker,
	type MediaPipeFrameResult
} from './engine/mediapipe-hand-tracker.js';
import { createCaptureSession, type CaptureSession } from './pipeline/capture.js';

export interface HandTrackingContext {
	hands: HandLandmarks[];
	gesture: GestureEvent | null;
	cursor: Point3D | null;
	debug: {
		engine: 'mediapipe';
		stage: HandTrackingStage;
		ready: boolean;
		hasVideoElement: boolean;
		frameWidth: number;
		frameHeight: number;
		skinRatio: number;
		yThreshold: number;
		detectedHands: number;
		contourCount: number;
		candidateCount: number;
		largestContourRatio: number;
		bestCandidateScore: number;
		latencyMs: number;
		lastVideoTimeMs: number;
		lastGesture: string | null;
		error: string | null;
	};
	isPinching: boolean;
	isTracking: boolean;
	isCalibrated: boolean;
	fps: number;
	calibration: CalibrationProfile | null;
	stream: MediaStream | null;
	video: HTMLVideoElement | null;
	start: () => Promise<void>;
	stop: () => void;
	recalibrate: () => void;
	attachVideo: (video: HTMLVideoElement | null) => void;
	setCalibration: (profile: CalibrationProfile | null) => void;
	applyResult: (result: MediaPipeFrameResult, timestamp: number) => void;
}

type HandTrackingStage =
	| 'idle'
	| 'requesting-camera'
	| 'preparing-video'
	| 'loading-mediapipe'
	| 'running'
	| 'error';

export interface HandTrackingContextOptions {
	calibration?: CalibrationProfile | null;
	ongesture?: (event: GestureEvent) => void;
	onhanddetected?: (hands: HandLandmarks[]) => void;
	onhandlost?: () => void;
	oncalibrated?: (profile: CalibrationProfile) => void;
	oncalibrationlost?: () => void;
	frameSize?: {
		width: number;
		height: number;
	};
}

const [getHandTrackingContext, setHandTrackingContext] = createContext<HandTrackingContext>();

export { getHandTrackingContext, setHandTrackingContext };

export function createHandTrackingContext(
	options: HandTrackingContextOptions = {}
): HandTrackingContext {
	function trackerOptions() {
		return options.frameSize
			? {
					frameWidth: options.frameSize.width,
					frameHeight: options.frameSize.height
				}
			: {};
	}

	const state = $state({
		hands: [] as HandLandmarks[],
		gesture: null as GestureEvent | null,
		cursor: null as Point3D | null,
		debug: {
			engine: 'mediapipe' as const,
			stage: 'idle' as HandTrackingStage,
			ready: false,
			hasVideoElement: false,
			frameWidth: 0,
			frameHeight: 0,
			skinRatio: 0,
			yThreshold: 0,
			detectedHands: 0,
			contourCount: 0,
			candidateCount: 0,
			largestContourRatio: 0,
			bestCandidateScore: 0,
			latencyMs: 0,
			lastVideoTimeMs: 0,
			lastGesture: null as string | null,
			error: null as string | null
		},
		isPinching: false,
		isTracking: false,
		isCalibrated: options.calibration?.stable ?? false,
		fps: 0,
		calibration: options.calibration ?? null,
		stream: null as MediaStream | null,
		video: null as HTMLVideoElement | null
	});

	let frameLoop: FrameLoop | null = null;
	let captureSession: CaptureSession | null = null;
	let tracker = createMediaPipeHandTracker(trackerOptions());
	let abortController: AbortController | null = null;
	let lastFrameTimestamp = 0;

	async function start(): Promise<void> {
		if (typeof window === 'undefined' || state.isTracking) {
			return;
		}

		let cameraHintTimeout = 0;

		try {
			state.debug.stage = 'requesting-camera';
			state.debug.error = null;

			if (
				!state.stream ||
				!state.stream.active ||
				state.stream.getVideoTracks().every((track) => track.readyState === 'ended')
			) {
				cameraHintTimeout = window.setTimeout(() => {
					if (state.debug.stage !== 'requesting-camera' || state.stream?.active) {
						return;
					}

					state.debug.error = navigator.webdriver
						? 'Camera stream is not starting in this automated browser. Open /hands in your normal browser window.'
						: 'Still waiting for camera access. Check the camera permission prompt for this tab.';
				}, 4000);

				state.stream = await navigator.mediaDevices.getUserMedia({
					video: {
						facingMode: 'user',
						width: { ideal: options.frameSize?.width ?? 320 },
						height: { ideal: options.frameSize?.height ?? 240 }
					},
					audio: false
				});
			}

			window.clearTimeout(cameraHintTimeout);

			if (!state.video) {
				throw new Error('Hand tracking requires a video element before calling start().');
			}

			state.debug.stage = 'preparing-video';
			captureSession = await createCaptureSession(state.stream, state.video, options.frameSize);
			state.debug.stage = 'loading-mediapipe';
			await tracker.initialize();

			abortController = new AbortController();
			state.isTracking = true;
			state.debug.stage = 'running';
			state.debug.ready = true;
			state.debug.error = null;

			frameLoop = createFrameLoop({
				budgetMs: 12,
				onFrame: async (timestamp) => {
					if (!captureSession || !state.video || abortController?.signal.aborted) {
						return;
					}

					const result = tracker.run(state.video, timestamp, captureSession.canvas);
					applyResult(result, timestamp);
				}
			});

			frameLoop.start();
		} catch (error) {
			abortController?.abort();
			abortController = null;
			frameLoop?.stop();
			frameLoop = null;
			captureSession?.stop();
			captureSession = null;
			state.stream = null;
			state.isTracking = false;
			state.debug.stage = 'error';
			state.debug.ready = false;
			state.debug.error =
				error instanceof Error ? error.message : 'Failed to start MediaPipe hand tracking.';
			window.clearTimeout(cameraHintTimeout);
			throw error;
		}
	}

	function stop(): void {
		abortController?.abort();
		abortController = null;
		frameLoop?.stop();
		frameLoop = null;
		captureSession?.stop();
		captureSession = null;
		tracker.destroy();
		tracker = createMediaPipeHandTracker(trackerOptions());
		state.stream = null;
		state.isTracking = false;
		state.gesture = null;
		state.cursor = null;
		state.debug.stage = 'idle';
		state.debug.ready = false;
		state.debug.error = null;
		state.fps = 0;
		lastFrameTimestamp = 0;
	}

	function recalibrate(): void {
		state.isCalibrated = false;
		if (!state.calibration) {
			options.oncalibrationlost?.();
		}
	}

	function attachVideo(video: HTMLVideoElement | null): void {
		if (state.video === video) {
			return;
		}

		state.video = video;
		state.debug.hasVideoElement = video !== null;
	}

	function setCalibration(profile: CalibrationProfile | null): void {
		state.calibration = profile;
		state.isCalibrated = profile?.stable ?? false;
		if (profile?.stable) {
			options.oncalibrated?.(profile);
		} else {
			options.oncalibrationlost?.();
		}
	}

	function applyResult(result: MediaPipeFrameResult, timestamp: number): void {
		const previousHands = state.hands;
		const fps = lastFrameTimestamp > 0 ? 1000 / Math.max(1, timestamp - lastFrameTimestamp) : 0;
		lastFrameTimestamp = timestamp;

		state.hands = result.hands;
		state.gesture = result.gesture;
		state.cursor = result.cursor;
		state.debug = {
			engine: result.debug.engine,
			stage: result.debug.ready ? 'running' : state.debug.stage,
			ready: result.debug.ready,
			hasVideoElement: state.debug.hasVideoElement,
			frameWidth: result.debug.frameWidth,
			frameHeight: result.debug.frameHeight,
			skinRatio: result.debug.skinRatio,
			yThreshold: result.debug.yThreshold,
			detectedHands: result.hands.length,
			contourCount: result.debug.contourCount,
			candidateCount: result.debug.candidateCount,
			largestContourRatio: result.debug.largestContourRatio,
			bestCandidateScore: result.debug.bestCandidateScore,
			latencyMs: result.debug.latencyMs,
			lastVideoTimeMs: result.debug.lastVideoTimeMs,
			lastGesture: result.debug.lastGesture,
			error: result.debug.error
		};
		state.isPinching = result.gesture?.type === 'pinch' || result.gesture?.type === 'drag';
		state.fps = fps;

		if (previousHands.length === 0 && state.hands.length > 0) {
			options.onhanddetected?.(state.hands);
		}

		if (previousHands.length > 0 && state.hands.length === 0) {
			options.onhandlost?.();
		}

		if (result.gesture) {
			options.ongesture?.(result.gesture);
		}
	}

	const context = {
		get hands() {
			return state.hands;
		},
		get gesture() {
			return state.gesture;
		},
		get cursor() {
			return state.cursor;
		},
		get debug() {
			return state.debug;
		},
		get isPinching() {
			return state.isPinching;
		},
		get isTracking() {
			return state.isTracking;
		},
		get isCalibrated() {
			return state.isCalibrated;
		},
		get fps() {
			return state.fps;
		},
		get calibration() {
			return state.calibration;
		},
		get stream() {
			return state.stream;
		},
		get video() {
			return state.video;
		},
		start,
		stop,
		recalibrate,
		attachVideo,
		setCalibration,
		applyResult
	} as HandTrackingContext;

	return context;
}
