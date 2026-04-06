import { createContext } from '../utils/create-context.js';

interface HoverCardContext {
	readonly open: boolean;
	readonly triggerId: string;
	readonly contentId: string;
	triggerEl: HTMLElement | null;
	show: () => void;
	close: () => void;
}
export const [setHoverCardCtx, getHoverCardCtx] = createContext<HoverCardContext>('hover-card');
