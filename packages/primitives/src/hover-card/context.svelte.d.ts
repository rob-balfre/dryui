interface HoverCardContext {
	readonly open: boolean;
	readonly triggerId: string;
	readonly contentId: string;
	triggerEl: HTMLElement | null;
	show: () => void;
	close: () => void;
}
export declare function setHoverCardCtx(ctx: HoverCardContext): HoverCardContext;
export declare function getHoverCardCtx(): HoverCardContext;
export {};
