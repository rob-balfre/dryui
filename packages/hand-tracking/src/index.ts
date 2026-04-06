export type {
	Bounds2D,
	CalibrationProfile,
	GestureEvent,
	GestureType,
	HandLandmarks,
	Point3D
} from './types.js';

export {
	rgbToYCbCr,
	ycbcrToRgb,
	rgbImageToYCbCr,
	ycbcrImageToLuma
} from './pipeline/color-space.js';
export type { RGB, YCbCr } from './pipeline/color-space.js';

export {
	buildCalibrationHistogram,
	calculateCalibrationProfile,
	mergeCalibrationProfiles
} from './pipeline/calibration.js';
export type { CalibrationHistogram, CalibrationSample } from './pipeline/calibration.js';

export {
	DEFAULT_SKIN_THRESHOLDS,
	segmentSkinFromRgba,
	segmentSkinMask,
	otsuThreshold
} from './pipeline/skin-segmentation.js';
export type { SegmentationResult, SkinThresholds } from './pipeline/skin-segmentation.js';

export { createDiskKernel, dilate, erode, open, close } from './pipeline/morphology.js';
export type { BinaryMask, KernelOffset } from './pipeline/morphology.js';

export {
	extractContours,
	findLargestContour,
	polygonArea,
	simplifyCollinear
} from './pipeline/contour.js';
export type { Contour, Point2D } from './pipeline/contour.js';

export { convexHull, convexityDefects, distanceToSegment } from './pipeline/convex-hull.js';
export type { ConvexityDefect } from './pipeline/convex-hull.js';

export { analyzeHandContour } from './pipeline/hand-geometry.js';
export type { HandGeometry } from './pipeline/hand-geometry.js';

export { classifyGesture, createGestureFSM } from './pipeline/gesture.js';
export type { GestureClassifierOptions, GestureMetrics, GestureState } from './pipeline/gesture.js';

export { assignTrackedHands, estimateCursor } from './pipeline/tracking.js';
export type { TrackedHand } from './pipeline/tracking.js';

export { createCaptureSession } from './pipeline/capture.js';
export type { CaptureFrame, CaptureSession } from './pipeline/capture.js';

export { createFrameLoop } from './engine/frame-loop.js';
export type { FrameLoop } from './engine/frame-loop.js';

export { createPipelineRunner, inferGesture } from './engine/pipeline-runner.js';
export type { PipelineInput, PipelineResult, PipelineRunner } from './engine/pipeline-runner.js';

export { createWorkerBridge } from './engine/worker-bridge.js';
export type {
	HandTrackerWorkerBridge,
	HandTrackerWorkerRequest,
	HandTrackerWorkerResponse
} from './engine/worker-bridge.js';

export {
	createHandTrackingContext,
	getHandTrackingContext,
	setHandTrackingContext
} from './context.svelte.js';
export type { HandTrackingContext, HandTrackingContextOptions } from './context.svelte.js';

import HandTrackingRoot from './hand-tracking-root.svelte';
import HandTrackingVideo from './hand-tracking-video.svelte';
import HandTrackingOverlay from './hand-tracking-overlay.svelte';
import HandTrackingCalibrator from './hand-tracking-calibrator.svelte';

export { HandTrackingRoot, HandTrackingVideo, HandTrackingOverlay, HandTrackingCalibrator };

export const HandTracking: {
	Root: typeof HandTrackingRoot;
	Video: typeof HandTrackingVideo;
	Overlay: typeof HandTrackingOverlay;
	Calibrator: typeof HandTrackingCalibrator;
} = {
	Root: HandTrackingRoot,
	Video: HandTrackingVideo,
	Overlay: HandTrackingOverlay,
	Calibrator: HandTrackingCalibrator
};
