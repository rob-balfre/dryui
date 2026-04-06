interface AlertDialogContext {
	readonly open: boolean;
	readonly headerId: string;
	show: () => void;
	close: () => void;
}
export declare function setAlertDialogCtx(ctx: AlertDialogContext): AlertDialogContext;
export declare function getAlertDialogCtx(): AlertDialogContext;
export {};
