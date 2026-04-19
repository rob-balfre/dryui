import { createContext } from '../utils/create-context.js';

export interface MegaMenuContext {
	readonly activeItem: string | null;
	openItem: (id: string, triggerId: string) => void;
	closeItem: () => void;
}
export const [setMegaMenuCtx, getMegaMenuCtx] = createContext<MegaMenuContext>('mega-menu');

export interface MegaMenuItemContext {
	readonly itemId: string;
	readonly triggerId: string;
	readonly panelId: string;
	readonly open: boolean;
}
export const [setMegaMenuItemCtx, getMegaMenuItemCtx] =
	createContext<MegaMenuItemContext>('mega-menu-item');
