import { createContext } from '../utils/create-context.js';

interface ToolbarContext {
	readonly orientation: 'horizontal' | 'vertical';
}
export const [setToolbarCtx, getToolbarCtx] = createContext<ToolbarContext>('toolbar');
