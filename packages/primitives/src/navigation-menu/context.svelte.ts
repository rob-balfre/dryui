import { createContext } from '../utils/create-context.js';

export interface NavigationMenuContext {
	readonly activeItem: string | null;
	openItem: (id: string) => void;
	closeItem: () => void;
}
export const [setNavigationMenuCtx, getNavigationMenuCtx] =
	createContext<NavigationMenuContext>('navigation-menu');

export interface NavigationMenuItemContext {
	readonly itemId: string;
	readonly triggerId: string;
	readonly contentId: string;
	readonly open: boolean;
}
export const [setNavigationMenuItemCtx, getNavigationMenuItemCtx] =
	createContext<NavigationMenuItemContext>('navigation-menu-item');
