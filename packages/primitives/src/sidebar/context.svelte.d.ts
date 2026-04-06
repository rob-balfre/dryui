interface SidebarContext {
	readonly collapsed: boolean;
	readonly side: 'left' | 'right';
	toggle: () => void;
	expand: () => void;
	collapse: () => void;
}
export declare function setSidebarCtx(ctx: SidebarContext): SidebarContext;
export declare function getSidebarCtx(): SidebarContext;
export {};
