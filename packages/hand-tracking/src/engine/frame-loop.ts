export interface FrameLoopOptions {
	budgetMs?: number;
	onFrame: (timestamp: number) => void | Promise<void>;
	requestAnimationFrame?: (callback: FrameRequestCallback) => number;
	cancelAnimationFrame?: (handle: number) => void;
}

export interface FrameLoop {
	start: () => void;
	stop: () => void;
	readonly running: boolean;
}

export function createFrameLoop(options: FrameLoopOptions): FrameLoop {
	const raf =
		options.requestAnimationFrame ??
		((callback: FrameRequestCallback) => {
			const handle = globalThis.setTimeout(() => callback(performance.now()), 16);
			return handle as unknown as number;
		});
	const caf =
		options.cancelAnimationFrame ??
		((handle: number) => {
			globalThis.clearTimeout(handle as unknown as ReturnType<typeof globalThis.setTimeout>);
		});
	const budgetMs = options.budgetMs ?? 16;
	let handle = 0;
	let running = false;
	let lastFrameStart = -budgetMs;

	const tick = async (timestamp: number) => {
		if (!running) {
			return;
		}

		const delta = timestamp - lastFrameStart;
		if (delta < budgetMs) {
			handle = raf(tick);
			return;
		}

		lastFrameStart = timestamp;
		await options.onFrame(timestamp);
		handle = raf(tick);
	};

	return {
		start() {
			if (running) {
				return;
			}
			running = true;
			lastFrameStart = -budgetMs;
			handle = raf(tick);
		},
		stop() {
			if (!running) {
				return;
			}
			running = false;
			caf(handle);
			handle = 0;
		},
		get running() {
			return running;
		}
	};
}
