import { createContext } from '@dryui/primitives';

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
