import { createContext } from '../utils/create-context.js';

export interface StatCardContext {
	readonly tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
	readonly density: 'comfortable' | 'compact';
}
export const [setStatCardCtx, getStatCardCtx] = createContext<StatCardContext>('stat-card');
