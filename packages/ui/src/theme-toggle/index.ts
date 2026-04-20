import type { Snippet } from 'svelte';
import type { ClassValue, HTMLButtonAttributes } from 'svelte/elements';

export { createThemeController } from './theme-controller.svelte.js';
export type {
	ThemeMode,
	ThemeController,
	ThemeControllerOptions
} from './theme-controller.svelte.js';

export { themeFlashScript } from './theme-flash.js';

import type { ThemeController, ThemeMode } from './theme-controller.svelte.js';

export interface ThemeToggleProps extends Omit<
	HTMLButtonAttributes,
	'onclick' | 'onkeydown' | 'disabled' | 'class'
> {
	storageKey?: string;
	size?: 'sm' | 'md' | 'lg';
	controller?: ThemeController;
	'aria-label'?: string;
	sunIcon?: Snippet;
	moonIcon?: Snippet;
	onModeChange?: (mode: ThemeMode) => void;
	disabled?: boolean;
	class?: ClassValue;
}

export { default as ThemeToggle } from './theme-toggle.svelte';
