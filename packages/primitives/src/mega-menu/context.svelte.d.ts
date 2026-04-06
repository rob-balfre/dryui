export interface MegaMenuContext {
	readonly activeItem: string | null;
	openItem: (id: string) => void;
	closeItem: () => void;
}
export declare function setMegaMenuCtx(ctx: MegaMenuContext): MegaMenuContext;
export declare function getMegaMenuCtx(): MegaMenuContext;
export interface MegaMenuItemContext {
	readonly itemId: string;
	readonly triggerId: string;
	readonly open: boolean;
}
export declare function setMegaMenuItemCtx(ctx: MegaMenuItemContext): MegaMenuItemContext;
export declare function getMegaMenuItemCtx(): MegaMenuItemContext;
