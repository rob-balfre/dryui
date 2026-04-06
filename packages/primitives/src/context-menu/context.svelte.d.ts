export interface ContextMenuContext {
	readonly open: boolean;
	readonly triggerId: string;
	readonly contentId: string;
	triggerEl: HTMLElement | null;
	position: {
		x: number;
		y: number;
	};
	show: () => void;
	close: () => void;
	toggle: () => void;
}
export declare function setContextMenuCtx(ctx: ContextMenuContext): ContextMenuContext;
export declare function getContextMenuCtx(): ContextMenuContext;
