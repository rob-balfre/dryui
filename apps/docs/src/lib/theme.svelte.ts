import { browser } from '$app/environment';

const STORAGE_KEY = 'dryui-docs-theme';
const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

export type ThemePreference = 'system' | 'light' | 'dark';

export const themeState: { preference: ThemePreference; systemPrefersDark: boolean } = $state({
	preference: 'system',
	systemPrefersDark: false
});

let mountedToggles = 0;
let stopWatchingSystemTheme: (() => void) | null = null;

function readStoredPreference(): ThemePreference {
	if (!browser) {
		return 'system';
	}

	try {
		const stored = window.localStorage.getItem(STORAGE_KEY);
		if (stored === 'light' || stored === 'dark') {
			return stored;
		}

		if (stored !== null) {
			window.localStorage.removeItem(STORAGE_KEY);
		}
	} catch {
		// Ignore storage access failures and fall back to system mode.
	}

	return 'system';
}

function writeStoredPreference(preference: ThemePreference): void {
	if (!browser) {
		return;
	}

	try {
		if (preference === 'system') {
			window.localStorage.removeItem(STORAGE_KEY);
			return;
		}

		window.localStorage.setItem(STORAGE_KEY, preference);
	} catch {
		// Ignore storage access failures and fall back to the current session state.
	}
}

function syncSystemPreference(mediaQuery?: MediaQueryList): void {
	if (!browser) {
		return;
	}

	themeState.systemPrefersDark = (mediaQuery ?? window.matchMedia(DARK_MEDIA_QUERY)).matches;
}

function readPreferenceFromDom(): ThemePreference {
	if (!browser) {
		return 'system';
	}

	const explicitTheme = document.documentElement.dataset.theme;
	return explicitTheme === 'light' || explicitTheme === 'dark' ? explicitTheme : 'system';
}

function syncThemeState(mediaQuery?: MediaQueryList): void {
	syncSystemPreference(mediaQuery);
	themeState.preference = readPreferenceFromDom();
}

function applyThemePreference(preference: ThemePreference): void {
	if (!browser) {
		return;
	}

	const root = document.documentElement;
	themeState.preference = preference;

	if (preference === 'system') {
		root.classList.add('theme-auto');
		delete root.dataset.theme;
		return;
	}

	root.classList.remove('theme-auto');
	root.dataset.theme = preference;
}

export function setThemePreference(preference: ThemePreference): void {
	applyThemePreference(preference);
	writeStoredPreference(preference);
}

export function resetThemePreference(): void {
	setThemePreference('system');
}

export function mountTheme(): () => void {
	if (!browser) {
		return () => {};
	}

	mountedToggles += 1;

	const mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);
	syncThemeState(mediaQuery);

	const storedPreference = readStoredPreference();
	if (storedPreference !== themeState.preference) {
		applyThemePreference(storedPreference);
	}

	if (!stopWatchingSystemTheme) {
		const handleChange = (event: MediaQueryListEvent) => {
			themeState.systemPrefersDark = event.matches;
		};

		mediaQuery.addEventListener('change', handleChange);

		stopWatchingSystemTheme = () => {
			mediaQuery.removeEventListener('change', handleChange);
			stopWatchingSystemTheme = null;
		};
	}

	return () => {
		mountedToggles -= 1;

		if (mountedToggles === 0 && stopWatchingSystemTheme) {
			stopWatchingSystemTheme();
		}
	};
}

export function isDarkTheme(): boolean {
	return (
		themeState.preference === 'dark' ||
		(themeState.preference === 'system' && themeState.systemPrefersDark)
	);
}

export function toggleTheme(): void {
	const nextPreference = isDarkTheme() ? 'light' : 'dark';
	setThemePreference(nextPreference);
}

if (browser) {
	mountTheme();
}
