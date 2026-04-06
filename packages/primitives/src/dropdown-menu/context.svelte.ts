import { createContext } from '../utils/create-context.js';

export interface DropdownMenuContext {
	readonly open: boolean;
	readonly triggerId: string;
	readonly contentId: string;
	triggerEl: HTMLElement | null;
	show: () => void;
	close: () => void;
	toggle: () => void;
}
export const [setDropdownMenuCtx, getDropdownMenuCtx] =
	createContext<DropdownMenuContext>('dropdown-menu');
