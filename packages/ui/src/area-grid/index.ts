import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type AreaGridSpace = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AreaGridAreaElement =
	| 'section'
	| 'header'
	| 'main'
	| 'nav'
	| 'aside'
	| 'article'
	| 'footer';

export interface AreaGridRootProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
	gap?: AreaGridSpace;
	padding?: AreaGridSpace;
	debug?: boolean;
	children: Snippet;
}

export interface AreaGridAreaProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
	as?: AreaGridAreaElement;
	children: Snippet;
}

import AreaGridRoot from './area-grid-root.svelte';
import AreaGridArea from './area-grid-area.svelte';

export const AreaGrid: {
	Root: typeof AreaGridRoot;
	Area: typeof AreaGridArea;
} = {
	Root: AreaGridRoot,
	Area: AreaGridArea
};
