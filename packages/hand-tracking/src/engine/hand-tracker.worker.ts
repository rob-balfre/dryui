import {
	createPipelineRunner,
	type PipelineRunner,
	type PipelineRunnerOptions
} from './pipeline-runner.js';
import type { HandTrackerWorkerRequest, HandTrackerWorkerResponse } from './worker-bridge.js';

type WorkerScope = typeof globalThis & {
	postMessage: (message: HandTrackerWorkerResponse) => void;
	onmessage: ((event: MessageEvent<HandTrackerWorkerRequest>) => void) | null;
};

const workerScope = globalThis as WorkerScope;

let runner: PipelineRunner = createPipelineRunner();

function configure(options?: PipelineRunnerOptions): void {
	runner = createPipelineRunner(options);
}

workerScope.onmessage = (event) => {
	const message = event.data;

	try {
		if (message.type === 'configure') {
			configure(message.options);
			workerScope.postMessage({ type: 'ready' });
			return;
		}

		if (message.type === 'run') {
			if (!message.input) {
				throw new Error('Worker run message is missing a pipeline input.');
			}

			workerScope.postMessage({
				type: 'result',
				result: runner.run(message.input)
			});
			return;
		}

		if (message.type === 'dispose') {
			workerScope.postMessage({ type: 'disposed' });
		}
	} catch (error) {
		workerScope.postMessage({
			type: 'error',
			message: (error as Error).message
		});
	}
};
