import { classifyGesture, type GestureMetrics } from '../pipeline/gesture.js';
import { createLegacyPipelineRunner } from './legacy-pipeline-runner.js';
import type { PipelineRunner, PipelineRunnerOptions } from './pipeline-types.js';

export type {
	MediaPipePipelineOptions,
	PipelineInput,
	PipelineResult,
	PipelineRunner,
	PipelineRunnerOptions
} from './pipeline-types.js';

export function createPipelineRunner(options: PipelineRunnerOptions = {}): PipelineRunner {
	// The synchronous pipeline runner remains the legacy compatibility surface
	// for tests and worker-based callers. The live Svelte webcam path now uses
	// the MediaPipe hand tracker directly via context.svelte.ts.
	return createLegacyPipelineRunner(options);
}

export function inferGesture(metrics: GestureMetrics): ReturnType<typeof classifyGesture> {
	return classifyGesture(metrics);
}
