import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type AreaGridMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface AreaGridRootProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
	maxWidth?: AreaGridMaxWidth;
	fill?: boolean;
	debug?: boolean;
	seams?: boolean;
	children: Snippet;
}

export interface AreaGridPlaceholderProps {
	area: string;
}

import AreaGridRoot from './area-grid-root.svelte';
import AreaGridPlaceholder from './area-grid-placeholder.svelte';
import AreaGridShell from './area-grid-shell.svelte';

export const AreaGrid: {
	Root: typeof AreaGridRoot;
	Placeholder: typeof AreaGridPlaceholder;
	Shell: typeof AreaGridShell;
} = {
	Root: AreaGridRoot,
	Placeholder: AreaGridPlaceholder,
	Shell: AreaGridShell
};
