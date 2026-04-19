import { createContext } from '@dryui/primitives';

export interface MenubarContext {
	readonly activeMenu: string | null;
	readonly hasOpenMenu: boolean;
	readonly rootElement: HTMLElement | null;
	openMenu: (id: string) => void;
	closeMenu: () => void;
	registerMenu: (id: string) => void;
	unregisterMenu: (id: string) => void;
	getMenuIds: () => string[];
	focusNextMenu: (currentId: string, open?: boolean) => void;
	focusPrevMenu: (currentId: string, open?: boolean) => void;
}

export const [setMenubarCtx, getMenubarCtx] = createContext<MenubarContext>('menubar');

export interface MenubarMenuContext {
	readonly menuId: string;
	readonly open: boolean;
}

export const [setMenubarMenuCtx, getMenubarMenuCtx] =
	createContext<MenubarMenuContext>('menubar-menu');
