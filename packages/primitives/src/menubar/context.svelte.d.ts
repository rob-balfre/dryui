export interface MenubarContext {
	readonly activeMenu: string | null;
	readonly hasOpenMenu: boolean;
	readonly rootElement: HTMLElement | null;
	openMenu: (id: string) => void;
	closeMenu: () => void;
	registerMenu: (id: string) => void;
	unregisterMenu: (id: string) => void;
	getMenuIds: () => string[];
	focusNextMenu: (currentId: string) => void;
	focusPrevMenu: (currentId: string) => void;
}
export declare function setMenubarCtx(ctx: MenubarContext): MenubarContext;
export declare function getMenubarCtx(): MenubarContext;

export interface MenubarMenuContext {
	readonly menuId: string;
	readonly open: boolean;
}
export declare function setMenubarMenuCtx(ctx: MenubarMenuContext): MenubarMenuContext;
export declare function getMenubarMenuCtx(): MenubarMenuContext;
