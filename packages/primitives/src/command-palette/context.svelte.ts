import { createContext } from '../utils/create-context.js';

export interface CommandPaletteContext {
	readonly open: boolean;
	query: string;
	activeItemId: string;
	itemCount: number;
	show: () => void;
	close: () => void;
	readonly listId: string;
	readonly inputId: string;
	registerItem: (id: string, el: HTMLElement) => void;
	unregisterItem: (id: string) => void;
	setActiveItem: (id: string) => void;
	getItems: () => Map<string, HTMLElement>;
}
export const [setCommandPaletteCtx, getCommandPaletteCtx] =
	createContext<CommandPaletteContext>('command-palette');
