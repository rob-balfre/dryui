import { createContext } from '@dryui/primitives';

interface ToastContext {
	readonly id: string;
	readonly variant: 'info' | 'success' | 'warning' | 'error';
}
export const [setToastCtx, getToastCtx] = createContext<ToastContext>('toast');
