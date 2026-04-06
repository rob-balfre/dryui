import { createContext } from '../utils/create-context.js';

interface DrawerContext {
	readonly open: boolean;
	readonly side: 'top' | 'right' | 'bottom' | 'left';
	readonly headerId: string;
	show: () => void;
	close: () => void;
}
export const [setDrawerCtx, getDrawerCtx] = createContext<DrawerContext>('drawer');
