const STATE_KEY = '__dryui_layout_mode_freeze';
const STYLE_ID = 'dryui-layout-mode-freeze-styles';

interface FreezeState {
	frozen: boolean;
	installed: boolean;
	origSetTimeout: typeof setTimeout;
	origSetInterval: typeof setInterval;
	origRAF: typeof requestAnimationFrame;
	pausedAnimations: Animation[];
	timeoutQueue: Array<() => void>;
	rafQueue: FrameRequestCallback[];
}

function getState(): FreezeState {
	if (
		typeof window === 'undefined' ||
		typeof window.setTimeout !== 'function' ||
		typeof window.setInterval !== 'function' ||
		typeof window.requestAnimationFrame !== 'function'
	) {
		return {
			frozen: false,
			installed: true,
			origSetTimeout: setTimeout,
			origSetInterval: setInterval,
			origRAF: () => 0,
			pausedAnimations: [],
			timeoutQueue: [],
			rafQueue: []
		};
	}

	const global = window as Window & { [STATE_KEY]?: FreezeState };
	if (!global[STATE_KEY]) {
		global[STATE_KEY] = {
			frozen: false,
			installed: false,
			origSetTimeout: window.setTimeout.bind(window),
			origSetInterval: window.setInterval.bind(window),
			origRAF: window.requestAnimationFrame.bind(window),
			pausedAnimations: [],
			timeoutQueue: [],
			rafQueue: []
		};
	}

	return global[STATE_KEY];
}

const state = getState();

if (
	typeof window !== 'undefined' &&
	typeof window.setTimeout === 'function' &&
	typeof window.setInterval === 'function' &&
	typeof window.requestAnimationFrame === 'function' &&
	!state.installed
) {
	window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
		if (typeof handler === 'string') {
			return state.origSetTimeout(handler, timeout, ...args);
		}

		return state.origSetTimeout(
			(...invokeArgs: unknown[]) => {
				if (state.frozen) {
					state.timeoutQueue.push(() =>
						(handler as (...handlerArgs: unknown[]) => void)(...invokeArgs)
					);
					return;
				}
				(handler as (...handlerArgs: unknown[]) => void)(...invokeArgs);
			},
			timeout,
			...args
		);
	}) as typeof setTimeout;

	window.setInterval = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
		if (typeof handler === 'string') {
			return state.origSetInterval(handler, timeout, ...args);
		}

		return state.origSetInterval(
			(...invokeArgs: unknown[]) => {
				if (!state.frozen) {
					(handler as (...handlerArgs: unknown[]) => void)(...invokeArgs);
				}
			},
			timeout,
			...args
		);
	}) as typeof setInterval;

	window.requestAnimationFrame = ((callback: FrameRequestCallback) => {
		return state.origRAF((timestamp: number) => {
			if (state.frozen) {
				state.rafQueue.push(callback);
				return;
			}
			callback(timestamp);
		});
	}) as typeof requestAnimationFrame;

	state.installed = true;
}

function shouldExclude(element: Element | null): boolean {
	return Boolean(element?.closest('[data-dryui-feedback]'));
}

export const originalSetTimeout = state.origSetTimeout;
export const originalSetInterval = state.origSetInterval;
export const originalRequestAnimationFrame = state.origRAF;

export function freezeLayoutModeAnimations(): void {
	if (typeof document === 'undefined' || state.frozen) return;
	state.frozen = true;
	state.timeoutQueue = [];
	state.rafQueue = [];

	const style = document.getElementById(STYLE_ID) ?? document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = `
    *:not([data-dryui-feedback]):not([data-dryui-feedback] *) ,
    *:not([data-dryui-feedback]):not([data-dryui-feedback] *)::before,
    *:not([data-dryui-feedback]):not([data-dryui-feedback] *)::after {
      animation-play-state: paused !important;
      transition: none !important;
    }
  `;
	document.head.appendChild(style);

	state.pausedAnimations = [];
	try {
		document.getAnimations().forEach((animation) => {
			if (animation.playState !== 'running') return;
			const target = (animation.effect as KeyframeEffect | null)?.target as Element | null;
			if (!shouldExclude(target)) {
				animation.pause();
				state.pausedAnimations.push(animation);
			}
		});
	} catch {
		// Not all browser environments expose getAnimations.
	}

	document.querySelectorAll('video').forEach((video) => {
		if (!video.paused) {
			video.dataset.wasPaused = 'false';
			video.pause();
		}
	});
}

export function unfreezeLayoutModeAnimations(): void {
	if (typeof document === 'undefined' || !state.frozen) return;
	state.frozen = false;

	const timeoutQueue = state.timeoutQueue;
	state.timeoutQueue = [];
	for (const callback of timeoutQueue) {
		state.origSetTimeout(() => {
			if (state.frozen) {
				state.timeoutQueue.push(callback);
				return;
			}
			callback();
		}, 0);
	}

	const rafQueue = state.rafQueue;
	state.rafQueue = [];
	for (const callback of rafQueue) {
		state.origRAF((timestamp) => {
			if (state.frozen) {
				state.rafQueue.push(callback);
				return;
			}
			callback(timestamp);
		});
	}

	for (const animation of state.pausedAnimations) {
		try {
			animation.play();
		} catch {
			// ignore resume failures
		}
	}
	state.pausedAnimations = [];

	document.getElementById(STYLE_ID)?.remove();

	document.querySelectorAll('video').forEach((video) => {
		if (video.dataset.wasPaused === 'false') {
			video.play().catch(() => {});
			delete video.dataset.wasPaused;
		}
	});
}

export function isLayoutModeFrozen(): boolean {
	return state.frozen;
}
