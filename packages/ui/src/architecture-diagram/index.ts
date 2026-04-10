import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface ArchitectureDiagramRootProps extends HTMLAttributes<HTMLDivElement> {
	layout?: 'horizontal' | 'vertical';
	children: Snippet;
}

export interface ArchitectureDiagramCenterProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface ArchitectureDiagramGroupProps extends HTMLAttributes<HTMLDivElement> {
	label: string;
	position?: 'start' | 'end';
	color?: 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';
	children: Snippet;
}

export interface ArchitectureDiagramItemProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

import ArchitectureDiagramRoot from './architecture-diagram-root.svelte';
import ArchitectureDiagramCenter from './architecture-diagram-center.svelte';
import ArchitectureDiagramGroup from './architecture-diagram-group.svelte';
import ArchitectureDiagramItem from './architecture-diagram-item.svelte';

export const ArchitectureDiagram: {
	Root: typeof ArchitectureDiagramRoot;
	Center: typeof ArchitectureDiagramCenter;
	Group: typeof ArchitectureDiagramGroup;
	Item: typeof ArchitectureDiagramItem;
} = {
	Root: ArchitectureDiagramRoot,
	Center: ArchitectureDiagramCenter,
	Group: ArchitectureDiagramGroup,
	Item: ArchitectureDiagramItem
};
