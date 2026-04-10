import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface LayerDiagramRootProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface LayerDiagramLayerProps extends HTMLAttributes<HTMLDivElement> {
	label: string;
	description?: string;
	color?: 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';
	children?: Snippet;
}

import LayerDiagramRoot from './layer-diagram-root.svelte';
import LayerDiagramLayer from './layer-diagram-layer.svelte';

export const LayerDiagram: {
	Root: typeof LayerDiagramRoot;
	Layer: typeof LayerDiagramLayer;
} = {
	Root: LayerDiagramRoot,
	Layer: LayerDiagramLayer
};
