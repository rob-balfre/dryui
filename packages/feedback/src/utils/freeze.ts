const EXCLUDE_SELECTOR = '[data-dryui-feedback]';
const STATE_KEY = '__dryui_feedback_freeze__';
const STYLE_ID = 'dryui-feedback-freeze-styles';

interface FreezeState {
	frozen: boolean;
	installed: boolean;
	origSetTimeout: typeof setTimeout;
	origSetInterval: typeof setInterval;
	origRAF: typeof requestAnimationFrame;
	pausedAnimations: Animation[];
	queuedTimeouts: Array<() => void>;
	queuedRAFs: FrameRequestCallback[];
}

function getServerState(): FreezeState {
	return {
		frozen: false,
		installed: true,
		origSetTimeout: setTimeout,
		origSetInterval: setInterval,
		origRAF: (callback: FrameRequestCallback) => {
			callback(0);
			return 0 as ReturnType<typeof requestAnimationFrame>;
		},
		pausedAnimations: [],
		queuedTimeouts: [],
		queuedRAFs: []
	};
}

function getState(): FreezeState {
	if (typeof window === 'undefined') return getServerState();

	const record = window as Window & { [STATE_KEY]?: FreezeState };
	if (!record[STATE_KEY]) {
		record[STATE_KEY] = {
			frozen: false,
			installed: false,
			origSetTimeout: window.setTimeout.bind(window),
			origSetInterval: window.setInterval.bind(window),
			origRAF: window.requestAnimationFrame.bind(window),
			pausedAnimations: [],
			queuedTimeouts: [],
			queuedRAFs: []
		};
	}

	return record[STATE_KEY]!;
}

const state = getState();

if (typeof window !== 'undefined' && !state.installed) {
	window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) =>
		state.origSetTimeout(
			(...callbackArgs: unknown[]) => {
				if (typeof handler === 'string') return;
				if (state.frozen) {
					state.queuedTimeouts.push(() => handler(...callbackArgs));
					return;
				}
				handler(...callbackArgs);
			},
			timeout,
			...args
		)) as typeof setTimeout;

	window.setInterval = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) =>
		state.origSetInterval(
			(...callbackArgs: unknown[]) => {
				if (typeof handler === 'string') return;
				if (!state.frozen) {
					handler(...callbackArgs);
				}
			},
			timeout,
			...args
		)) as typeof setInterval;

	window.requestAnimationFrame = ((callback: FrameRequestCallback) =>
		state.origRAF((timestamp: number) => {
			if (state.frozen) {
				state.queuedRAFs.push(callback);
				return;
			}
			callback(timestamp);
		})) as typeof requestAnimationFrame;

	state.installed = true;
}

function excludedAnimationTarget(target: Element | null): boolean {
	return Boolean(target?.closest(EXCLUDE_SELECTOR));
}

export const originalSetTimeout = state.origSetTimeout;
export const originalSetInterval = state.origSetInterval;
export const originalRequestAnimationFrame = state.origRAF;

export function freezeAnimations(): void {
	if (typeof document === 'undefined' || state.frozen) return;

	state.frozen = true;
	state.queuedTimeouts = [];
	state.queuedRAFs = [];

	let style = document.getElementById(STYLE_ID);
	if (!style) {
		style = document.createElement('style');
		style.id = STYLE_ID;
		document.head.appendChild(style);
	}

	style.textContent = `
    html[data-dryui-feedback-frozen='true'] body *:not(${EXCLUDE_SELECTOR}):not(${EXCLUDE_SELECTOR} *)::before,
    html[data-dryui-feedback-frozen='true'] body *:not(${EXCLUDE_SELECTOR}):not(${EXCLUDE_SELECTOR} *)::after,
    html[data-dryui-feedback-frozen='true'] body *:not(${EXCLUDE_SELECTOR}):not(${EXCLUDE_SELECTOR} *) {
      animation-play-state: paused;
      transition-duration: 0s;
      transition-delay: 0s;
    }
  `;

	document.documentElement.dataset.dryuiFeedbackFrozen = 'true';

	try {
		state.pausedAnimations = [];
		document.getAnimations().forEach((animation) => {
			if (animation.playState !== 'running') return;

			const target = (animation.effect as KeyframeEffect | null)?.target as Element | null;
			if (excludedAnimationTarget(target)) return;

			animation.pause();
			state.pausedAnimations.push(animation);
		});
	} catch {
		// getAnimations is not universally available
	}

	document.querySelectorAll('video').forEach((video) => {
		if (!video.paused) {
			video.dataset.dryuiFeedbackWasPaused = 'false';
			video.pause();
		}
	});
}

export function unfreezeAnimations(): void {
	if (typeof document === 'undefined' || !state.frozen) return;

	state.frozen = false;
	delete document.documentElement.dataset.dryuiFeedbackFrozen;
	document.getElementById(STYLE_ID)?.remove();

	const queuedTimeouts = state.queuedTimeouts;
	state.queuedTimeouts = [];
	for (const callback of queuedTimeouts) {
		state.origSetTimeout(() => {
			if (state.frozen) {
				state.queuedTimeouts.push(callback);
				return;
			}
			callback();
		}, 0);
	}

	const queuedRAFs = state.queuedRAFs;
	state.queuedRAFs = [];
	for (const callback of queuedRAFs) {
		state.origRAF((timestamp: number) => {
			if (state.frozen) {
				state.queuedRAFs.push(callback);
				return;
			}
			callback(timestamp);
		});
	}

	for (const animation of state.pausedAnimations) {
		try {
			animation.play();
		} catch {
			// animation may have been discarded by the browser
		}
	}
	state.pausedAnimations = [];

	document.querySelectorAll('video').forEach((video) => {
		if (video.dataset.dryuiFeedbackWasPaused === 'false') {
			video.play().catch(() => {});
			delete video.dataset.dryuiFeedbackWasPaused;
		}
	});
}

export function toggleAnimationsFrozen(): boolean {
	if (state.frozen) {
		unfreezeAnimations();
		return false;
	}

	freezeAnimations();
	return true;
}

export function animationsAreFrozen(): boolean {
	return state.frozen;
}
