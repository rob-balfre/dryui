import { createContext } from '../utils/create-context.js';

interface ListContext {
	readonly dense: boolean;
	readonly disablePadding: boolean;
}
export const [setListCtx, getListCtx] = createContext<ListContext>('list');
