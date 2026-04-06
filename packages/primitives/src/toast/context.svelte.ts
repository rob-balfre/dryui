import { createContext } from '../utils/create-context.js';

interface ToastContext {
	readonly id: string;
	readonly variant: 'info' | 'success' | 'warning' | 'error';
}
export const [setToastCtx, getToastCtx] = createContext<ToastContext>('toast');
