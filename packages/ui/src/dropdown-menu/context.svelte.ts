import { createContext } from '@dryui/primitives';
import type { MenuRootState } from '../internal/menu-root-state.svelte.js';

export interface DropdownMenuContext extends MenuRootState {}

export const [setDropdownMenuCtx, getDropdownMenuCtx] =
	createContext<DropdownMenuContext>('dropdown-menu');
