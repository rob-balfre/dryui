interface TooltipContext {
	readonly open: boolean;
	readonly triggerId: string;
	readonly contentId: string;
	triggerEl: HTMLElement | null;
	show: () => void;
	close: () => void;
	showImmediate: () => void;
	closeImmediate: () => void;
}
export declare function setTooltipCtx(ctx: TooltipContext): TooltipContext;
export declare function getTooltipCtx(): TooltipContext;
export {};
