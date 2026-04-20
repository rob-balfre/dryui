import { beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import { Window } from 'happy-dom';

let window: InstanceType<typeof Window>;
let document: Document;

beforeAll(() => {
	window = new Window();
	document = window.document as unknown as Document;

	(globalThis as Record<string, unknown>).window = window;
	(globalThis as Record<string, unknown>).document = document;
	(globalThis as Record<string, unknown>).HTMLElement = window.HTMLElement;
	(globalThis as Record<string, unknown>).localStorage = window.localStorage;
});

beforeEach(() => {
	try {
		window.localStorage.clear();
	} catch {
		/* ignore */
	}

	document.documentElement.className = '';
	delete (document.documentElement as unknown as HTMLElement).dataset.theme;
});

// The controller factory uses Svelte runes ($state, $derived), which are
// only available inside Svelte's compiler. We exercise the pure DOM/storage
// helpers directly (exported alongside createThemeController for testing).
async function loadHelpers() {
	const mod = await import('../../packages/ui/src/theme-toggle/theme-controller.svelte.ts');
	return {
		readStoredMode: mod.readStoredMode,
		writeStoredMode: mod.writeStoredMode,
		applyModeToDom: mod.applyModeToDom,
		DEFAULT_STORAGE_KEY: mod.DEFAULT_STORAGE_KEY
	};
}

describe('theme controller storage', () => {
	test('readStoredMode defaults to system when nothing is stored', async () => {
		const { readStoredMode } = await loadHelpers();
		expect(readStoredMode('dryui-theme')).toBe('system');
	});

	test('readStoredMode returns the stored explicit value', async () => {
		const { readStoredMode } = await loadHelpers();

		window.localStorage.setItem('dryui-theme', 'dark');
		expect(readStoredMode('dryui-theme')).toBe('dark');

		window.localStorage.setItem('dryui-theme', 'light');
		expect(readStoredMode('dryui-theme')).toBe('light');
	});

	test('readStoredMode clears junk values and returns system', async () => {
		const { readStoredMode } = await loadHelpers();

		window.localStorage.setItem('dryui-theme', 'blue');
		expect(readStoredMode('dryui-theme')).toBe('system');
		expect(window.localStorage.getItem('dryui-theme')).toBeNull();
	});

	test('writeStoredMode persists light/dark and removes for system', async () => {
		const { writeStoredMode } = await loadHelpers();

		writeStoredMode('dryui-theme', 'dark');
		expect(window.localStorage.getItem('dryui-theme')).toBe('dark');

		writeStoredMode('dryui-theme', 'light');
		expect(window.localStorage.getItem('dryui-theme')).toBe('light');

		writeStoredMode('dryui-theme', 'system');
		expect(window.localStorage.getItem('dryui-theme')).toBeNull();
	});

	test('writeStoredMode honors a custom storage key', async () => {
		const { writeStoredMode } = await loadHelpers();

		writeStoredMode('my-app-theme', 'dark');
		expect(window.localStorage.getItem('my-app-theme')).toBe('dark');
		expect(window.localStorage.getItem('dryui-theme')).toBeNull();
	});

	test('DEFAULT_STORAGE_KEY is the expected string', async () => {
		const { DEFAULT_STORAGE_KEY } = await loadHelpers();
		expect(DEFAULT_STORAGE_KEY).toBe('dryui-theme');
	});
});

describe('theme controller DOM application', () => {
	test('applyModeToDom("system") adds theme-auto and clears data-theme', async () => {
		const { applyModeToDom } = await loadHelpers();

		document.documentElement.dataset.theme = 'dark';
		document.documentElement.classList.remove('theme-auto');

		applyModeToDom('system');

		expect(document.documentElement.classList.contains('theme-auto')).toBe(true);
		expect(document.documentElement.dataset.theme).toBeUndefined();
	});

	test('applyModeToDom("dark") sets data-theme and removes theme-auto', async () => {
		const { applyModeToDom } = await loadHelpers();

		document.documentElement.classList.add('theme-auto');

		applyModeToDom('dark');

		expect(document.documentElement.dataset.theme).toBe('dark');
		expect(document.documentElement.classList.contains('theme-auto')).toBe(false);
	});

	test('applyModeToDom("light") sets data-theme and removes theme-auto', async () => {
		const { applyModeToDom } = await loadHelpers();

		document.documentElement.classList.add('theme-auto');

		applyModeToDom('light');

		expect(document.documentElement.dataset.theme).toBe('light');
		expect(document.documentElement.classList.contains('theme-auto')).toBe(false);
	});
});

describe('themeFlashScript', () => {
	test('produces an IIFE referencing the default key', async () => {
		const mod = await import('../../packages/ui/src/theme-toggle/theme-flash.ts');
		const script = mod.themeFlashScript();

		expect(script).toContain('"dryui-theme"');
		expect(script).toContain("'theme-auto'");
		expect(script).toContain('root.dataset.theme');
		expect(script.trim().startsWith('(() =>')).toBe(true);
	});

	test('honors a custom storage key', async () => {
		const mod = await import('../../packages/ui/src/theme-toggle/theme-flash.ts');
		const script = mod.themeFlashScript('dryui-docs-theme');

		expect(script).toContain('"dryui-docs-theme"');
		expect(script).not.toContain('"dryui-theme"');
	});

	test('safely escapes unusual storage keys', async () => {
		const mod = await import('../../packages/ui/src/theme-toggle/theme-flash.ts');
		const script = mod.themeFlashScript('my"weird\nkey');

		// JSON.stringify must have escaped the quote and newline.
		expect(script).toContain('"my\\"weird\\nkey"');
	});

	test('applying the generated script reads localStorage and applies the DOM', async () => {
		const mod = await import('../../packages/ui/src/theme-toggle/theme-flash.ts');

		window.localStorage.setItem('dryui-theme', 'dark');
		document.documentElement.className = '';
		delete (document.documentElement as unknown as HTMLElement).dataset.theme;

		// Evaluate the script with the window/document bound as globals.
		const script = mod.themeFlashScript();
		const runner = new Function('window', 'document', `${script}`);
		runner(window, document);

		expect(document.documentElement.dataset.theme).toBe('dark');
		expect(document.documentElement.classList.contains('theme-auto')).toBe(false);
	});
});
