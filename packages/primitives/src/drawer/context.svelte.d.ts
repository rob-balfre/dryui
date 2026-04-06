interface DrawerContext {
	readonly open: boolean;
	readonly side: 'top' | 'right' | 'bottom' | 'left';
	readonly headerId: string;
	show: () => void;
	close: () => void;
}
export declare function setDrawerCtx(ctx: DrawerContext): DrawerContext;
export declare function getDrawerCtx(): DrawerContext;
export {};
