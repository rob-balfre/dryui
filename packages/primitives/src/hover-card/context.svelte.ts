import { createContext } from '../utils/create-context.js';

export interface HoverCardContext {
	readonly open: boolean;
	readonly triggerId: string;
	readonly contentId: string;
	triggerEl: HTMLElement | null;
	contentEl: HTMLElement | null;
	triggerHovered: boolean;
	contentHovered: boolean;
	triggerFocused: boolean;
	contentFocused: boolean;
	ignoreNextTriggerFocusOpen: boolean;
	show: () => void;
	showImmediate: () => void;
	close: () => void;
	forceClose: () => void;
}
export const [setHoverCardCtx, getHoverCardCtx] = createContext<HoverCardContext>('hover-card');
