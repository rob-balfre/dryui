import { createContext } from '../utils/create-context.js';

let tabsCounter = 0;

export function generateTabsId(): string {
	return `tabs-${++tabsCounter}`;
}

interface TabsContext {
	readonly id: string;
	readonly value: string;
	readonly orientation: 'horizontal' | 'vertical';
	readonly activationMode: 'automatic' | 'manual';
	select: (value: string) => void;
}
export const [setTabsCtx, getTabsCtx] = createContext<TabsContext>('tabs');
