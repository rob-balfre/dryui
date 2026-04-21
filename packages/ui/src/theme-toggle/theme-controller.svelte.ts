export type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeControllerOptions {
	/**
	 * Storage key used to persist the explicit theme preference.
	 * When the user selects system mode the key is removed.
	 * Defaults to `'dryui-theme'`.
	 */
	storageKey?: string;
}

export interface ThemeController {
	/** Current stored preference: `'system'`, `'light'`, or `'dark'`. */
	readonly mode: ThemeMode;
	/**
	 * Whether the active rendered theme is dark. Tracks `prefers-color-scheme`
	 * when the mode is `'system'`.
	 */
	readonly isDark: boolean;
	/** Whether the system color-scheme preference is currently dark. */
	readonly systemPrefersDark: boolean;
	/** Apply an explicit mode and persist it (or clear persistence for `'system'`). */
	setMode(mode: ThemeMode): void;
	/** Toggle between the two rendered themes, writing an explicit preference. */
	cycle(): void;
	/** Return to system mode and clear any persisted preference. */
	reset(): void;
	/** Stop watching `matchMedia` changes. Called automatically on HMR disposal. */
	destroy(): void;
}

const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';
export const DEFAULT_STORAGE_KEY = 'dryui-theme';

function isBrowser(): boolean {
	return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Read the stored theme mode. Exported for testing; production callers
 * should go through `createThemeController`.
 */
export function readStoredMode(storageKey: string): ThemeMode {
	if (!isBrowser()) return 'system';

	try {
		const stored = window.localStorage.getItem(storageKey);
		if (stored === 'light' || stored === 'dark') {
			return stored;
		}

		if (stored !== null) {
			window.localStorage.removeItem(storageKey);
		}
	} catch {
		// Storage access can fail in private browsing contexts, so fall back to system mode.
	}

	return 'system';
}

/**
 * Persist the theme mode. When `mode === 'system'`, removes the key.
 * Exported for testing.
 */
export function writeStoredMode(storageKey: string, mode: ThemeMode): void {
	if (!isBrowser()) return;

	try {
		if (mode === 'system') {
			window.localStorage.removeItem(storageKey);
			return;
		}
		window.localStorage.setItem(storageKey, mode);
	} catch {
		// Ignore storage failures; the in-memory state still reflects the choice.
	}
}

/**
 * Apply the mode to `<html>` via `classList.theme-auto` and `dataset.theme`.
 * Exported for testing.
 */
export function applyModeToDom(mode: ThemeMode): void {
	if (!isBrowser()) return;

	const root = document.documentElement;

	if (mode === 'system') {
		root.classList.add('theme-auto');
		delete root.dataset.theme;
		return;
	}

	root.classList.remove('theme-auto');
	root.dataset.theme = mode;
}

/**
 * Create a theme controller that reads the current preference from storage,
 * applies it to `<html>`, and watches the system color-scheme for changes.
 *
 * The returned object exposes reactive `mode`, `isDark`, and `systemPrefersDark`
 * properties backed by Svelte 5 `$state`, plus imperative methods for changing
 * or resetting the mode.
 */
export function createThemeController(options: ThemeControllerOptions = {}): ThemeController {
	const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;

	const initialMode: ThemeMode = readStoredMode(storageKey);
	let mode = $state<ThemeMode>(initialMode);
	let systemPrefersDark = $state<boolean>(false);

	let mediaQuery: MediaQueryList | null = null;
	let stopWatching: (() => void) | null = null;

	if (isBrowser()) {
		mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);
		systemPrefersDark = mediaQuery.matches;

		// Align the DOM with the stored preference in case the app-level flash
		// script was skipped or the key changed between renders.
		applyModeToDom(initialMode);

		const handleChange = (event: MediaQueryListEvent) => {
			systemPrefersDark = event.matches;
		};

		mediaQuery.addEventListener('change', handleChange);
		stopWatching = () => {
			mediaQuery?.removeEventListener('change', handleChange);
			stopWatching = null;
		};
	}

	const isDark = $derived(mode === 'dark' || (mode === 'system' && systemPrefersDark));

	function setMode(next: ThemeMode): void {
		mode = next;
		applyModeToDom(next);
		writeStoredMode(storageKey, next);
	}

	function cycle(): void {
		setMode(isDark ? 'light' : 'dark');
	}

	function reset(): void {
		setMode('system');
	}

	function destroy(): void {
		stopWatching?.();
	}

	return {
		get mode() {
			return mode;
		},
		get isDark() {
			return isDark;
		},
		get systemPrefersDark() {
			return systemPrefersDark;
		},
		setMode,
		cycle,
		reset,
		destroy
	};
}
