import { createContext } from '@dryui/primitives';

interface FloatButtonContext {
	readonly open: boolean;
	toggle: () => void;
}
export const [setFloatButtonCtx, getFloatButtonCtx] =
	createContext<FloatButtonContext>('float-button');
