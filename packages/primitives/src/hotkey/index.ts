export interface HotkeyProps {
	keys: string;
	handler: () => void;
	enabled?: boolean;
	preventDefault?: boolean;
}

export { default as Hotkey } from './hotkey.svelte';
export { createHotkey } from './hotkey.js';
export type { HotkeyConfig } from './hotkey.js';
