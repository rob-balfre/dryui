export interface NavigationMenuContext {
	readonly activeItem: string | null;
	openItem: (id: string) => void;
	closeItem: () => void;
}
export declare function setNavigationMenuCtx(ctx: NavigationMenuContext): NavigationMenuContext;
export declare function getNavigationMenuCtx(): NavigationMenuContext;

export interface NavigationMenuItemContext {
	readonly itemId: string;
	readonly triggerId: string;
	readonly open: boolean;
}
export declare function setNavigationMenuItemCtx(
	ctx: NavigationMenuItemContext
): NavigationMenuItemContext;
export declare function getNavigationMenuItemCtx(): NavigationMenuItemContext;
