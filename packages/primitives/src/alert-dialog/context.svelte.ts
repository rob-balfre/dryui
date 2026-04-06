import { createContext } from '../utils/create-context.js';

interface AlertDialogContext {
	readonly open: boolean;
	readonly headerId: string;
	show: () => void;
	close: () => void;
}
export const [setAlertDialogCtx, getAlertDialogCtx] =
	createContext<AlertDialogContext>('alert-dialog');
