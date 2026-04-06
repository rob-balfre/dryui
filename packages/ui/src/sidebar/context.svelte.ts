import { createContext } from '@dryui/primitives';

interface SidebarContext {
	readonly collapsed: boolean;
	readonly side: 'left' | 'right';
	toggle: () => void;
	expand: () => void;
	collapse: () => void;
}
export const [setSidebarCtx, getSidebarCtx] = createContext<SidebarContext>('sidebar');
