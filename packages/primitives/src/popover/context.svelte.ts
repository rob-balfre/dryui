import { createContext } from '../utils/create-context.js';

interface PopoverContext {
	readonly open: boolean;
	readonly triggerId: string;
	readonly contentId: string;
	triggerEl: HTMLElement | null;
	toggle: () => void;
	show: () => void;
	close: () => void;
}
export const [setPopoverCtx, getPopoverCtx] = createContext<PopoverContext>('popover');
