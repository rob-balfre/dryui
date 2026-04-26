import { createContext } from '@dryui/primitives';

interface FloatButtonContext {
	readonly open: boolean;
	readonly menuId: string;
	toggle: () => void;
	close: () => void;
}
export const [setFloatButtonCtx, getFloatButtonCtx] =
	createContext<FloatButtonContext>('float-button');
