import { createContext } from '@dryui/primitives';
import type { PositionedMenuRootState } from '../internal/menu-root-state.svelte.js';

export interface ContextMenuContext extends PositionedMenuRootState {}

export const [setContextMenuCtx, getContextMenuCtx] =
	createContext<ContextMenuContext>('context-menu');
