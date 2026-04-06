export interface CommandPaletteContext {
	readonly open: boolean;
	query: string;
	activeItemId: string;
	show: () => void;
	close: () => void;
	readonly listId: string;
	readonly inputId: string;
	registerItem: (id: string, el: HTMLElement) => void;
	unregisterItem: (id: string) => void;
	setActiveItem: (id: string) => void;
	getItems: () => Map<string, HTMLElement>;
}
export declare function setCommandPaletteCtx(ctx: CommandPaletteContext): CommandPaletteContext;
export declare function getCommandPaletteCtx(): CommandPaletteContext;
