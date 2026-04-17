import { createContext } from '@dryui/primitives';

export interface MegaMenuContext {
	readonly activeItem: string | null;
	readonly rootEl: HTMLElement | null;
	setRootEl: (el: HTMLElement | null) => void;
	openItem: (id: string) => void;
	closeItem: () => void;
}
export const [setMegaMenuCtx, getMegaMenuCtx] = createContext<MegaMenuContext>('mega-menu');

export interface MegaMenuItemContext {
	readonly itemId: string;
	readonly triggerId: string;
	readonly open: boolean;
}
export const [setMegaMenuItemCtx, getMegaMenuItemCtx] =
	createContext<MegaMenuItemContext>('mega-menu-item');
