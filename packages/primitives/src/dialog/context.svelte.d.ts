interface DialogContext {
	readonly open: boolean;
	readonly headerId: string;
	show: () => void;
	close: () => void;
}
export declare function setDialogCtx(ctx: DialogContext): DialogContext;
export declare function getDialogCtx(): DialogContext;
export {};
