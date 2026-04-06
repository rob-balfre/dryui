import { createContext } from '@dryui/primitives';

interface ToolbarContext {
	readonly orientation: 'horizontal' | 'vertical';
}
export const [setToolbarCtx, getToolbarCtx] = createContext<ToolbarContext>('toolbar');
