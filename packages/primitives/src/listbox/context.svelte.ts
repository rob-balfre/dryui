import { createContext } from '../utils/create-context.js';

export interface ListboxContext {
	readonly disabled: boolean;
	readonly multiple: boolean;
	select: (value: string) => void;
	isSelected: (value: string) => boolean;
}
export const [setListboxCtx, getListboxCtx] = createContext<ListboxContext>('listbox');
