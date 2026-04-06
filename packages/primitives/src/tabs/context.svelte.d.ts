interface TabsContext {
	readonly value: string;
	readonly orientation: 'horizontal' | 'vertical';
	readonly activationMode: 'automatic' | 'manual';
	select: (value: string) => void;
}
export declare function setTabsCtx(ctx: TabsContext): TabsContext;
export declare function getTabsCtx(): TabsContext;
export {};
