import { createContext } from '../utils/create-context.js';

interface TooltipContext {
	readonly open: boolean;
	readonly triggerId: string;
	readonly contentId: string;
	triggerEl: HTMLElement | null;
	show: () => void;
	close: () => void;
	showImmediate: () => void;
	closeImmediate: () => void;
}
export const [setTooltipCtx, getTooltipCtx] = createContext<TooltipContext>('tooltip');
