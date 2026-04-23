import { createContext } from '../utils/create-context.js';

// Mirrors @dryui/ui's `BadgeColor` / `AliasableColor` literally. Duplicated here
// because @dryui/primitives must not depend on @dryui/ui. Keep in sync.
export type PageHeaderMetaColor =
	| 'gray'
	| 'blue'
	| 'red'
	| 'green'
	| 'yellow'
	| 'purple'
	| 'orange'
	| 'info'
	| 'success'
	| 'warning'
	| 'danger';

export interface PageHeaderMetaContext {
	readonly variant: 'solid' | 'outline' | 'soft' | undefined;
	readonly color: PageHeaderMetaColor | undefined;
	readonly size: 'sm' | 'md' | undefined;
}

export const [setPageHeaderMetaCtx, getPageHeaderMetaCtx] =
	createContext<PageHeaderMetaContext>('page-header-meta');
