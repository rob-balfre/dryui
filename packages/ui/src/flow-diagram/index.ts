import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface FlowDiagramRootProps extends HTMLAttributes<HTMLDivElement> {
	direction?: 'horizontal' | 'vertical';
	children: Snippet;
}

export interface FlowDiagramNodeProps extends HTMLAttributes<HTMLDivElement> {
	color?: 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';
	variant?: 'default' | 'outlined' | 'filled';
	children: Snippet;
}

import FlowDiagramRoot from './flow-diagram-root.svelte';
import FlowDiagramNode from './flow-diagram-node.svelte';

export const FlowDiagram: {
	Root: typeof FlowDiagramRoot;
	Node: typeof FlowDiagramNode;
} = {
	Root: FlowDiagramRoot,
	Node: FlowDiagramNode
};
