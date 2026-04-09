export type AlertVariant = 'info' | 'success' | 'warning' | 'error';
interface AlertContext {
	readonly variant: AlertVariant;
	readonly isDismissed: boolean;
	dismiss: () => void;
}
export declare const setAlertCtx: (ctx: AlertContext) => AlertContext,
	getAlertCtx: () => AlertContext;
export {};
