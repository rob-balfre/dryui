import { createContext } from '../utils/create-context.js';

interface FloatButtonContext {
	readonly open: boolean;
	toggle: () => void;
}
export const [setFloatButtonCtx, getFloatButtonCtx] =
	createContext<FloatButtonContext>('float-button');
