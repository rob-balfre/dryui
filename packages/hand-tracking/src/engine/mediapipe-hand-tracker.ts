import { createGestureFSM, type GestureMetrics } from '../pipeline/gesture.js';
import { assignTrackedHands } from '../pipeline/tracking.js';
import type { GestureEvent, HandLandmarks, Point3D } from '../types.js';

const DEFAULT_MODULE_URL =
	'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.33/vision_bundle.mjs';
const DEFAULT_WASM_ROOT = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.33/wasm';
const DEFAULT_MODEL_ASSET_PATH =
	'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

const PALM_INDICES = [0, 5, 9, 13, 17] as const;
const FINGERTIP_INDICES = [4, 8, 12, 16, 20] as const;
const FINGER_JOINTS = [
	[4, 3, 2],
	[8, 6, 5],
	[12, 10, 9],
	[16, 14, 13],
	[20, 18, 17]
] as const;

export interface MediaPipeHandTrackerOptions {
	frameWidth?: number;
	frameHeight?: number;
	numHands?: number;
	minHandDetectionConfidence?: number;
	minHandPresenceConfidence?: number;
	minTrackingConfidence?: number;
	moduleUrl?: string;
	wasmRoot?: string;
	modelAssetPath?: string;
}

export interface MediaPipeTrackerDebug {
	engine: 'mediapipe';
	ready: boolean;
	detectedHands: number;
	frameWidth: number;
	frameHeight: number;
	latencyMs: number;
	lastVideoTimeMs: number;
	lastGesture: string | null;
	error: string | null;
	skinRatio: number;
	yThreshold: number;
	contourCount: number;
	candidateCount: number;
	largestContourRatio: number;
	bestCandidateScore: number;
}

export interface MediaPipeFrameResult {
	hands: HandLandmarks[];
	gesture: GestureEvent | null;
	cursor: Point3D | null;
	debug: MediaPipeTrackerDebug;
}

export interface MediaPipeHandTracker {
	initialize: () => Promise<void>;
	run: (
		video: HTMLVideoElement,
		timestamp: number,
		captureCanvas?: HTMLCanvasElement
	) => MediaPipeFrameResult;
	destroy: () => void;
}

interface MediaPipeCategory {
	score: number;
	categoryName: string;
}

interface MediaPipeNormalizedLandmark {
	x: number;
	y: number;
	z: number;
	visibility?: number;
}

interface MediaPipeHandLandmarkerResult {
	landmarks: MediaPipeNormalizedLandmark[][];
	handedness: MediaPipeCategory[][];
}

interface MediaPipeFilesetResolver {
	forVisionTasks(wasmRoot: string): Promise<unknown>;
}

interface MediaPipeHandLandmarker {
	detectForVideo(video: HTMLVideoElement, timestamp: number): MediaPipeHandLandmarkerResult;
	close(): void;
}

interface MediaPipeHandLandmarkerFactory {
	createFromOptions(
		vision: unknown,
		options: {
			baseOptions: {
				modelAssetPath: string;
			};
			runningMode: 'VIDEO';
			numHands: number;
			minHandDetectionConfidence: number;
			minHandPresenceConfidence: number;
			minTrackingConfidence: number;
		}
	): Promise<MediaPipeHandLandmarker>;
}

interface MediaPipeVisionModule {
	FilesetResolver: MediaPipeFilesetResolver;
	HandLandmarker: MediaPipeHandLandmarkerFactory;
}

function distance(a: Point3D, b: Point3D): number {
	return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function averagePoint(points: Point3D[]): Point3D {
	if (points.length === 0) {
		return { x: 0, y: 0, z: 0 };
	}

	let sumX = 0;
	let sumY = 0;
	let sumZ = 0;

	for (const point of points) {
		sumX += point.x;
		sumY += point.y;
		sumZ += point.z;
	}

	return {
		x: sumX / points.length,
		y: sumY / points.length,
		z: sumZ / points.length
	};
}

function normalizeHandedness(value: string | undefined): HandLandmarks['handedness'] {
	if (value === 'Left') {
		return 'left';
	}

	if (value === 'Right') {
		return 'right';
	}

	return 'unknown';
}

function mapLandmarksToPoints(
	landmarks: MediaPipeHandLandmarkerResult['landmarks'][number] | undefined,
	frameWidth: number,
	frameHeight: number
): Point3D[] {
	if (!landmarks) {
		return [];
	}

	const depthScale = Math.max(frameWidth, frameHeight);

	return landmarks.map((landmark: MediaPipeNormalizedLandmark) => ({
		x: landmark.x * frameWidth,
		y: landmark.y * frameHeight,
		z: landmark.z * depthScale
	}));
}

function buildBoundingBox(points: Point3D[]): HandLandmarks['boundingBox'] {
	if (points.length === 0) {
		return {
			x: 0,
			y: 0,
			width: 0,
			height: 0
		};
	}

	let minX = Number.POSITIVE_INFINITY;
	let minY = Number.POSITIVE_INFINITY;
	let maxX = Number.NEGATIVE_INFINITY;
	let maxY = Number.NEGATIVE_INFINITY;

	for (const point of points) {
		minX = Math.min(minX, point.x);
		minY = Math.min(minY, point.y);
		maxX = Math.max(maxX, point.x);
		maxY = Math.max(maxY, point.y);
	}

	return {
		x: minX,
		y: minY,
		width: maxX - minX,
		height: maxY - minY
	};
}

function landmarksToHand(
	points: Point3D[],
	handedness: MediaPipeHandLandmarkerResult['handedness'][number] | undefined,
	timestamp: number
): HandLandmarks | null {
	if (points.length < 21) {
		return null;
	}

	const boundingBox = buildBoundingBox(points);
	const centroid = averagePoint(points);
	const palmCenter = averagePoint(PALM_INDICES.map((index) => points[index]!).filter(Boolean));
	const primaryHandedness = handedness?.[0];

	return {
		id: `hand-${normalizeHandedness(primaryHandedness?.categoryName)}-${Math.round(centroid.x)}`,
		points,
		handedness: normalizeHandedness(primaryHandedness?.categoryName),
		confidence: primaryHandedness?.score ?? 0,
		boundingBox,
		centroid,
		palmCenter,
		wrist: points[0]!,
		timestamp
	};
}

function estimateCursor(hand: HandLandmarks | null): Point3D | null {
	if (!hand) {
		return null;
	}

	const thumbTip = hand.points[4];
	const indexTip = hand.points[8];

	if (thumbTip && indexTip) {
		return {
			x: (thumbTip.x + indexTip.x) / 2,
			y: (thumbTip.y + indexTip.y) / 2,
			z: (thumbTip.z + indexTip.z) / 2
		};
	}

	return indexTip ?? hand.palmCenter;
}

function countExtendedFingers(hand: HandLandmarks): number {
	const normalizedSize = Math.max(hand.boundingBox.width, hand.boundingBox.height, 1);
	let count = 0;

	for (const [tipIndex, pipIndex, mcpIndex] of FINGER_JOINTS) {
		const tip = hand.points[tipIndex];
		const pip = hand.points[pipIndex];
		const mcp = hand.points[mcpIndex];

		if (!tip || !pip || !mcp) {
			continue;
		}

		const tipDistance = distance(tip, hand.palmCenter);
		const pipDistance = distance(pip, hand.palmCenter);
		const mcpDistance = distance(mcp, hand.palmCenter);

		if (tipDistance > pipDistance + normalizedSize * 0.04 && pipDistance > mcpDistance) {
			count += 1;
		}
	}

	return count;
}

function enrichGesture(
	gesture: GestureEvent | null,
	metrics: GestureMetrics,
	primaryHand: HandLandmarks | null,
	cursor: Point3D | null,
	separationDelta: number,
	movementDeltaX: number
): GestureEvent | null {
	if (!gesture) {
		return null;
	}

	const details: GestureEvent['details'] = {
		...gesture.details,
		fingerCount: metrics.fingerCount,
		selected: metrics.selected
	};

	if (gesture.type === 'two-hand-pinch') {
		details.delta = Math.round(separationDelta * 100);
	}

	if (gesture.type === 'swipe') {
		details.direction = movementDeltaX < 0 ? 'left' : 'right';
	}

	if (primaryHand) {
		details.handedness = primaryHand.handedness;
	}

	return {
		...gesture,
		cursor,
		handId: primaryHand?.id ?? gesture.handId,
		confidence: primaryHand?.confidence ?? gesture.confidence,
		details
	};
}

function emptyDebug(error: string | null = null): MediaPipeTrackerDebug {
	return {
		engine: 'mediapipe',
		ready: false,
		detectedHands: 0,
		frameWidth: 0,
		frameHeight: 0,
		latencyMs: 0,
		lastVideoTimeMs: 0,
		lastGesture: null,
		error,
		skinRatio: 0,
		yThreshold: 0,
		contourCount: 0,
		candidateCount: 0,
		largestContourRatio: 0,
		bestCandidateScore: 0
	};
}

function emptyFrame(error: string | null = null): MediaPipeFrameResult {
	return {
		hands: [],
		gesture: null,
		cursor: null,
		debug: emptyDebug(error)
	};
}

export function createMediaPipeHandTracker(
	options: MediaPipeHandTrackerOptions = {}
): MediaPipeHandTracker {
	const gestureFsm = createGestureFSM();
	const frameWidth = options.frameWidth ?? 320;
	const frameHeight = options.frameHeight ?? 240;
	const moduleUrl = options.moduleUrl ?? DEFAULT_MODULE_URL;
	let mediapipeModule: Promise<MediaPipeVisionModule> | null = null;
	let handLandmarker: MediaPipeHandLandmarker | null = null;
	let initialization: Promise<void> | null = null;
	let initializationError: string | null = null;
	let previousHands: HandLandmarks[] = [];
	let previousTimestamp = 0;
	let previousSeparation = 0;
	let stationaryMs = 0;
	let lastProcessedVideoTime = -1;
	let lastFrame = emptyFrame();

	async function initialize(): Promise<void> {
		if (handLandmarker) {
			return;
		}

		if (!initialization) {
			initialization = (async () => {
				mediapipeModule ??= import(
					/* @vite-ignore */
					moduleUrl
				) as Promise<MediaPipeVisionModule>;
				const visionModule = await mediapipeModule;
				const vision = await visionModule.FilesetResolver.forVisionTasks(
					options.wasmRoot ?? DEFAULT_WASM_ROOT
				);

				handLandmarker = await visionModule.HandLandmarker.createFromOptions(vision, {
					baseOptions: {
						modelAssetPath: options.modelAssetPath ?? DEFAULT_MODEL_ASSET_PATH
					},
					runningMode: 'VIDEO',
					numHands: options.numHands ?? 2,
					minHandDetectionConfidence: options.minHandDetectionConfidence ?? 0.35,
					minHandPresenceConfidence: options.minHandPresenceConfidence ?? 0.35,
					minTrackingConfidence: options.minTrackingConfidence ?? 0.35
				});
			})().catch((error) => {
				initializationError =
					error instanceof Error ? error.message : 'Failed to initialize MediaPipe hand tracking.';
				throw error;
			});
		}

		await initialization;
		initializationError = null;
	}

	return {
		initialize,
		run(video, timestamp, captureCanvas) {
			if (!handLandmarker) {
				return emptyFrame(initializationError);
			}

			if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth) {
				return lastFrame;
			}

			const videoTimeMs = Math.round(video.currentTime * 1000);

			if (videoTimeMs === lastProcessedVideoTime) {
				return lastFrame;
			}

			const start = performance.now();
			const sourceWidth = video.videoWidth || frameWidth;
			const sourceHeight = video.videoHeight || frameHeight;

			let detectionSource: HTMLVideoElement | HTMLCanvasElement = video;
			if (captureCanvas) {
				const capCtx = captureCanvas.getContext('2d');
				if (capCtx) {
					capCtx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
					detectionSource = captureCanvas;
				}
			}

			const result = handLandmarker.detectForVideo(
				detectionSource as HTMLVideoElement,
				videoTimeMs
			);
			const detectedHands = result.landmarks
				.map((landmarks: MediaPipeHandLandmarkerResult['landmarks'][number], index: number) =>
					landmarksToHand(
						mapLandmarksToPoints(landmarks, sourceWidth, sourceHeight),
						result.handedness[index],
						timestamp
					)
				)
				.filter((hand: HandLandmarks | null): hand is HandLandmarks => hand !== null);

			const trackedHands = assignTrackedHands(previousHands, detectedHands);
			const hands = trackedHands.map(({ trackingScore, previousId, ...hand }) => hand);
			const primaryHand = hands[0] ?? null;
			const previousPrimary = primaryHand
				? (previousHands.find((hand) => hand.id === primaryHand.id) ?? null)
				: null;

			const normalizedSize = Math.max(sourceWidth, sourceHeight, 1);
			const thumbTip = primaryHand?.points[4];
			const indexTip = primaryHand?.points[8];
			const pinkyTip = primaryHand?.points[20];
			const palmDelta =
				primaryHand && previousPrimary
					? distance(primaryHand.palmCenter, previousPrimary.palmCenter) / normalizedSize
					: 0;
			const movementDeltaX =
				primaryHand && previousPrimary
					? (primaryHand.palmCenter.x - previousPrimary.palmCenter.x) / normalizedSize
					: 0;

			if (primaryHand && palmDelta < 0.01 && previousTimestamp > 0) {
				stationaryMs += Math.max(0, timestamp - previousTimestamp);
			} else {
				stationaryMs = 0;
			}

			const handSeparation =
				hands.length >= 2
					? distance(hands[0]!.palmCenter, hands[1]!.palmCenter) / normalizedSize
					: 0;
			const separationDelta = handSeparation - previousSeparation;
			previousSeparation = handSeparation;

			const metrics: GestureMetrics = {
				fingerCount: primaryHand ? countExtendedFingers(primaryHand) : 0,
				thumbIndexDistance:
					thumbTip && indexTip
						? distance(thumbTip, indexTip) /
							Math.max(primaryHand?.boundingBox.width ?? 1, primaryHand?.boundingBox.height ?? 1, 1)
						: 1,
				thumbPinkyDistance:
					thumbTip && pinkyTip
						? distance(thumbTip, pinkyTip) /
							Math.max(primaryHand?.boundingBox.width ?? 1, primaryHand?.boundingBox.height ?? 1, 1)
						: 0,
				palmVelocity: palmDelta,
				movementDistance: palmDelta,
				stationaryMs,
				handCount: hands.length,
				handSeparation,
				selected: hands.length > 0
			};

			const cursor = estimateCursor(primaryHand);
			const gesture = enrichGesture(
				gestureFsm.update(metrics, cursor),
				metrics,
				primaryHand,
				cursor,
				separationDelta,
				movementDeltaX
			);

			previousHands = hands;
			previousTimestamp = timestamp;
			lastProcessedVideoTime = videoTimeMs;
			lastFrame = {
				hands,
				gesture,
				cursor,
				debug: {
					engine: 'mediapipe',
					ready: true,
					detectedHands: hands.length,
					frameWidth: sourceWidth,
					frameHeight: sourceHeight,
					latencyMs: performance.now() - start,
					lastVideoTimeMs: videoTimeMs,
					lastGesture: gesture?.type ?? null,
					error: initializationError,
					skinRatio: 0,
					yThreshold: 0,
					contourCount: 0,
					candidateCount: hands.length,
					largestContourRatio: 0,
					bestCandidateScore: primaryHand?.confidence ?? 0
				}
			};

			return lastFrame;
		},
		destroy() {
			handLandmarker?.close();
			handLandmarker = null;
			initialization = null;
			initializationError = null;
			previousHands = [];
			previousTimestamp = 0;
			previousSeparation = 0;
			stationaryMs = 0;
			lastProcessedVideoTime = -1;
			lastFrame = emptyFrame();
		}
	};
}
