import type { Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';

export type { GraphNodeDef } from './context.svelte.js';

export interface NodeGraphRootProps extends SVGAttributes<SVGSVGElement> {
	viewWidth?: number;
	viewHeight?: number;
	children: Snippet;
}

export interface NodeGraphNodeProps extends SVGAttributes<SVGGElement> {
	id: string;
	x: number;
	y: number;
	color?: 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';
	state?: 'default' | 'active' | 'complete' | 'blocked';
	children: Snippet;
}

export interface NodeGraphEdgeProps extends SVGAttributes<SVGLineElement> {
	from: string;
	to: string;
	label?: string;
	dashed?: boolean;
}

export interface NodeGraphClusterProps extends SVGAttributes<SVGGElement> {
	x: number;
	y: number;
	clusterWidth: number;
	clusterHeight: number;
	label?: string;
	color?: 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';
	children?: Snippet;
}

import NodeGraphRoot from './node-graph-root.svelte';
import NodeGraphNode from './node-graph-node.svelte';
import NodeGraphEdge from './node-graph-edge.svelte';
import NodeGraphCluster from './node-graph-cluster.svelte';

export const NodeGraph: {
	Root: typeof NodeGraphRoot;
	Node: typeof NodeGraphNode;
	Edge: typeof NodeGraphEdge;
	Cluster: typeof NodeGraphCluster;
} = {
	Root: NodeGraphRoot,
	Node: NodeGraphNode,
	Edge: NodeGraphEdge,
	Cluster: NodeGraphCluster
};
