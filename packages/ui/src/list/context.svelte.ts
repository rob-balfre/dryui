import { createContext } from '@dryui/primitives';

interface ListContext {
	readonly dense: boolean;
	readonly disablePadding: boolean;
}
export const [setListCtx, getListCtx] = createContext<ListContext>('list');
