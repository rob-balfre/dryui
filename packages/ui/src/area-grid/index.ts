import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type AreaGridSpace = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AreaGridRootProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
	gap?: AreaGridSpace;
	padding?: AreaGridSpace;
	fill?: boolean;
	debug?: boolean;
	children: Snippet;
}

import AreaGridRoot from './area-grid-root.svelte';

export const AreaGrid: {
	Root: typeof AreaGridRoot;
} = {
	Root: AreaGridRoot
};
