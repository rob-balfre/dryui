import {
	createPipelineRunner,
	type PipelineInput,
	type PipelineResult,
	type PipelineRunnerOptions
} from './pipeline-runner.js';

export interface HandTrackerWorkerRequest {
	type: 'configure' | 'run' | 'dispose';
	options?: PipelineRunnerOptions;
	input?: PipelineInput;
}

export interface HandTrackerWorkerResponse {
	type: 'ready' | 'result' | 'disposed' | 'error';
	result?: PipelineResult;
	message?: string;
}

export interface HandTrackerWorkerBridge {
	configure(options?: PipelineRunnerOptions): void;
	run(input: PipelineInput): void;
	destroy(): void;
}

export function createWorkerBridge(
	onMessage: (message: HandTrackerWorkerResponse) => void
): HandTrackerWorkerBridge {
	if (typeof Worker === 'undefined') {
		const runner = createPipelineRunner();
		onMessage({ type: 'ready' });

		return {
			configure() {},
			run(input) {
				onMessage({ type: 'result', result: runner.run(input) });
			},
			destroy() {
				onMessage({ type: 'disposed' });
			}
		};
	}

	const worker = new Worker(new URL('./hand-tracker.worker.ts', import.meta.url), {
		type: 'module'
	});
	worker.onmessage = (event: MessageEvent<HandTrackerWorkerResponse>) => {
		onMessage(event.data);
	};
	worker.postMessage({ type: 'configure' } satisfies HandTrackerWorkerRequest);

	return {
		configure(options) {
			worker.postMessage(
				options
					? ({ type: 'configure', options } satisfies HandTrackerWorkerRequest)
					: ({ type: 'configure' } satisfies HandTrackerWorkerRequest)
			);
		},
		run(input) {
			worker.postMessage({ type: 'run', input } satisfies HandTrackerWorkerRequest);
		},
		destroy() {
			worker.postMessage({ type: 'dispose' } satisfies HandTrackerWorkerRequest);
			worker.terminate();
		}
	};
}
