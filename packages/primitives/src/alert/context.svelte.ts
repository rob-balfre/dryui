import { createContext } from '../utils/create-context.js';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertContext {
	readonly variant: AlertVariant;
	readonly isDismissed: boolean;
	dismiss: () => void;
}
export const [setAlertCtx, getAlertCtx] = createContext<AlertContext>('alert');
