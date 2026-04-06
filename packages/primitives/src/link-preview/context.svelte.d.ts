interface LinkPreviewContext {
	readonly open: boolean;
	readonly triggerId: string;
	readonly contentId: string;
	triggerEl: HTMLElement | null;
	show: () => void;
	close: () => void;
	showImmediate: () => void;
	closeImmediate: () => void;
}
export declare function setLinkPreviewCtx(ctx: LinkPreviewContext): LinkPreviewContext;
export declare function getLinkPreviewCtx(): LinkPreviewContext;
export {};
