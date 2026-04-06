interface ToastContext {
	readonly id: string;
	readonly variant: 'info' | 'success' | 'warning' | 'error';
}
export declare function setToastCtx(ctx: ToastContext): ToastContext;
export declare function getToastCtx(): ToastContext;
export {};
