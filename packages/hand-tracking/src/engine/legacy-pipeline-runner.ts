import type { HandLandmarks } from '../types.js';
import { analyzeHandContour, type HandGeometry } from '../pipeline/hand-geometry.js';
import { close, createDiskKernel, open } from '../pipeline/morphology.js';
import { extractContours } from '../pipeline/contour.js';
import { segmentSkinFromRgba } from '../pipeline/skin-segmentation.js';
import { assignTrackedHands, estimateCursor } from '../pipeline/tracking.js';
import { createGestureFSM, type GestureMetrics } from '../pipeline/gesture.js';
import type {
	PipelineInput,
	PipelineResult,
	PipelineRunner,
	PipelineRunnerOptions
} from './pipeline-types.js';

function getTouchedFrameEdges(
	bounds: HandGeometry['contour']['bounds'],
	width: number,
	height: number,
	margin = 1
) {
	return {
		left: bounds.x <= margin,
		top: bounds.y <= margin,
		right: bounds.x + bounds.width >= width - margin,
		bottom: bounds.y + bounds.height >= height - margin
	};
}

function fingertipHorizontalSpread(item: HandGeometry): number {
	if (item.fingertips.length < 2) {
		return 0;
	}

	const xValues = item.fingertips.map((point) => point.x);
	return (Math.max(...xValues) - Math.min(...xValues) + 1) / Math.max(1, item.contour.bounds.width);
}

function fingertipVerticalSpread(item: HandGeometry): number {
	if (item.fingertips.length < 2) {
		return 0;
	}

	const yValues = item.fingertips.map((point) => point.y);
	return (
		(Math.max(...yValues) - Math.min(...yValues) + 1) / Math.max(1, item.contour.bounds.height)
	);
}

function palmHeightRatio(item: HandGeometry): number {
	return (item.palmCenter.y - item.contour.bounds.y) / Math.max(1, item.contour.bounds.height);
}

function isPlausibleHandCandidate(item: HandGeometry, width: number, height: number): boolean {
	const frameArea = Math.max(1, width * height);
	const areaRatio = item.contour.pixelCount / frameArea;
	const widthRatio = item.contour.bounds.width / Math.max(width, 1);
	const heightRatio = item.contour.bounds.height / Math.max(height, 1);
	const aspectRatio = item.contour.bounds.width / Math.max(item.contour.bounds.height, 1);
	const touchedEdges = getTouchedFrameEdges(item.contour.bounds, width, height);
	const fillRatio =
		item.contour.pixelCount / Math.max(1, item.contour.bounds.width * item.contour.bounds.height);
	const horizontalSpread = fingertipHorizontalSpread(item);
	const verticalSpread = fingertipVerticalSpread(item);
	const palmRatio = palmHeightRatio(item);

	if (item.contour.bounds.width < 28 || item.contour.bounds.height < 42) {
		return false;
	}

	if (areaRatio < 0.008 || areaRatio > 0.32) {
		return false;
	}

	if (widthRatio < 0.12 || widthRatio > 0.68 || heightRatio < 0.22 || heightRatio > 0.9) {
		return false;
	}

	if (aspectRatio < 0.28 || aspectRatio > 1.2) {
		return false;
	}

	if (touchedEdges.left || touchedEdges.right) {
		return false;
	}

	if (touchedEdges.top && touchedEdges.bottom) {
		return false;
	}

	if (fillRatio < 0.18 || fillRatio > 0.82) {
		return false;
	}

	if (horizontalSpread < 0.55) {
		return false;
	}

	if (verticalSpread > 0.82) {
		return false;
	}

	if (palmRatio > 0.46) {
		return false;
	}

	return true;
}

function scoreHandCandidate(item: HandGeometry, width: number, height: number): number {
	const frameArea = Math.max(1, width * height);
	const boundsArea = Math.max(1, item.contour.bounds.width * item.contour.bounds.height);
	const fillRatio = item.contour.pixelCount / boundsArea;
	const sizeRatio = item.contour.pixelCount / frameArea;
	const fingertipRatio = Math.min(item.maximaCount, 5) / 5;
	const centerX = item.palmCenter.x / Math.max(width, 1);
	const centerY = item.palmCenter.y / Math.max(height, 1);
	const centerDistance = Math.hypot(centerX - 0.5, centerY - 0.55);
	const centerBias = 1 - Math.min(1, centerDistance);
	const preferredArea = 0.07;
	const sizeBias = 1 - Math.min(1, Math.abs(sizeRatio - preferredArea) / preferredArea);
	const maximaBonus = item.fingertipSource === 'maxima' ? 1 : 0;
	const horizontalSpread = fingertipHorizontalSpread(item);
	const verticalSpread = fingertipVerticalSpread(item);
	const palmRatio = palmHeightRatio(item);
	const spreadBias = Math.max(0, Math.min(1, (horizontalSpread - 0.55) / 0.45));
	const compactnessPenalty = Math.max(0, verticalSpread - 0.6) * 2;
	const palmBias = Math.max(0, 1 - palmRatio);

	return (
		fingertipRatio * 7 +
		maximaBonus +
		Math.min(fillRatio, 1) * 1.5 +
		centerBias +
		Math.max(0, sizeBias) * 2 +
		spreadBias * 2 +
		palmBias -
		compactnessPenalty
	);
}

function selectPrimaryGeometry(
	candidates: HandGeometry[],
	width: number,
	height: number
): {
	geometry: HandGeometry[];
	candidateCount: number;
	bestCandidateScore: number;
} {
	const plausible = candidates.filter((candidate) =>
		isPlausibleHandCandidate(candidate, width, height)
	);

	if (plausible.length === 0) {
		return {
			geometry: [],
			candidateCount: 0,
			bestCandidateScore: 0
		};
	}

	const scored = plausible.map((candidate) => ({
		candidate,
		score: scoreHandCandidate(candidate, width, height)
	}));
	const primary = [...scored].sort((left, right) => right.score - left.score)[0];

	return {
		geometry: primary ? [primary.candidate] : [],
		candidateCount: plausible.length,
		bestCandidateScore: primary?.score ?? 0
	};
}

function geometryToMetrics(geometry: HandGeometry[]): GestureMetrics {
	const primary = geometry[0];
	if (!primary) {
		return {
			fingerCount: 0,
			thumbIndexDistance: 1,
			thumbPinkyDistance: 0,
			palmVelocity: 0,
			movementDistance: 0,
			stationaryMs: 0,
			handCount: 0,
			handSeparation: 0,
			selected: false
		};
	}

	const fingertips = primary.fingertips ?? [];
	const firstTip = fingertips[0] ?? null;
	const secondTip = fingertips[1] ?? null;
	const lastTip = fingertips[fingertips.length - 1] ?? null;
	const normalizedSize = Math.max(primary.contour.bounds.width, primary.contour.bounds.height, 1);
	const thumbIndexDistance = firstTip
		? Math.hypot(firstTip.x - primary.palmCenter.x, firstTip.y - primary.palmCenter.y) /
			normalizedSize
		: 1;
	const thumbPinkyDistance =
		firstTip && lastTip
			? Math.hypot(firstTip.x - lastTip.x, firstTip.y - lastTip.y) / normalizedSize
			: 0;

	return {
		fingerCount: fingertips.length,
		thumbIndexDistance,
		thumbPinkyDistance,
		palmVelocity: 0,
		movementDistance:
			secondTip && firstTip
				? Math.hypot(firstTip.x - secondTip.x, firstTip.y - secondTip.y) /
					Math.max(primary.contour.bounds.width, primary.contour.bounds.height, 1)
				: 0,
		stationaryMs: 0,
		handCount: geometry.length,
		handSeparation:
			geometry.length >= 2
				? Math.hypot(
						geometry[0]!.palmCenter.x - geometry[1]!.palmCenter.x,
						geometry[0]!.palmCenter.y - geometry[1]!.palmCenter.y
					)
				: 0,
		selected: geometry.length > 0
	};
}

export function createLegacyPipelineRunner(options: PipelineRunnerOptions = {}): PipelineRunner {
	const gestureFsm = createGestureFSM();
	const kernel = createDiskKernel(Math.max(1, options.budgetRadius ?? 2));
	let previousHands: HandLandmarks[] = [];
	let lastTimestamp = 0;

	return {
		gestureState: gestureFsm.state,
		run(input: PipelineInput): PipelineResult {
			const segmentation = segmentSkinFromRgba(
				input.rgba,
				input.width,
				input.height,
				options.calibration ?? null
			);
			const cleaned = close(
				open(segmentation.mask, input.width, input.height, kernel),
				input.width,
				input.height,
				kernel
			);
			const frameArea = Math.max(1, input.width * input.height);
			const minimumContourPixels = Math.max(160, Math.floor(input.width * input.height * 0.0035));
			const contours = extractContours(cleaned, input.width, input.height).filter(
				(contour) => contour.pixelCount >= minimumContourPixels
			);
			const analyzedContours = contours.map((contour) => analyzeHandContour(contour));
			const primarySelection = selectPrimaryGeometry(analyzedContours, input.width, input.height);
			const geometry = primarySelection.geometry;
			const trackedHands = assignTrackedHands(
				previousHands,
				geometry.map((item, index) => ({
					id: `hand-${index}`,
					points: item.skeleton,
					handedness: 'unknown',
					confidence: 1,
					boundingBox: item.contour.bounds,
					centroid: {
						x: item.contour.centroid.x,
						y: item.contour.centroid.y,
						z: 0
					},
					palmCenter: item.palmCenter,
					wrist: item.wrist,
					...(input.timestamp === undefined ? {} : { timestamp: input.timestamp })
				}))
			);
			previousHands = trackedHands.map(({ trackingScore, previousId, ...hand }) => ({ ...hand }));

			const metrics = geometryToMetrics(geometry);
			const cursor = geometry.length > 0 ? estimateCursor(trackedHands[0]!) : null;
			const gesture = gestureFsm.update(metrics, cursor);

			const timestamp = input.timestamp ?? performance.now();
			const fps = lastTimestamp > 0 ? 1000 / Math.max(1, timestamp - lastTimestamp) : 0;
			lastTimestamp = timestamp;

			return {
				mask: cleaned,
				hands: trackedHands,
				geometry,
				gesture,
				cursor,
				fps,
				yThreshold: segmentation.yThreshold,
				skinRatio: segmentation.skinRatio,
				debug: {
					contourCount: contours.length,
					candidateCount: primarySelection.candidateCount,
					largestContourRatio:
						contours.length > 0
							? Math.max(...contours.map((contour) => contour.pixelCount / frameArea))
							: 0,
					bestCandidateScore: primarySelection.bestCandidateScore,
					engine: 'legacy'
				}
			};
		}
	};
}
