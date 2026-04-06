import { createContext } from '../utils/create-context.js';

interface DialogContext {
	readonly open: boolean;
	readonly headerId: string;
	show: () => void;
	close: () => void;
}
export const [setDialogCtx, getDialogCtx] = createContext<DialogContext>('dialog');
