export type DiagramColor = 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';
export type DiagramDirection = 'TB' | 'BT' | 'LR' | 'RL';

export interface DiagramNode {
	id: string;
	label: string;
	description?: string;
	variant?: 'default' | 'filled' | 'outlined' | 'pill';
	color?: DiagramColor;
	state?: 'default' | 'active' | 'complete' | 'blocked';
	width?: number;
	height?: number;
}

export interface DiagramEdge {
	from: string;
	to: string;
	label?: string;
	arrow?: 'end' | 'start' | 'both' | 'none';
	dashed?: boolean;
	color?: DiagramColor;
}

export interface DiagramCluster {
	id: string;
	label?: string;
	nodes: string[];
	color?: DiagramColor;
	dashed?: boolean;
}

export interface DiagramAnnotation {
	text: string;
	anchor: string | { x: number; y: number };
	offset?: { dx?: number; dy?: number };
	color?: DiagramColor;
}

export interface DiagramSwimlane {
	id: string;
	label: string;
	nodes: string[];
	color?: DiagramColor;
}

export interface DiagramRegion {
	id: string;
	label: string;
	contains: string[];
	color?: DiagramColor;
	dashed?: boolean;
}

export interface DiagramConfig {
	nodes: DiagramNode[];
	edges: DiagramEdge[];
	clusters?: DiagramCluster[];
	annotations?: DiagramAnnotation[];
	direction?: DiagramDirection;
	layout?: 'layered' | 'swimlane';
	swimlanes?: DiagramSwimlane[];
	regions?: DiagramRegion[];
	spacing?: {
		nodeGap?: number;
		layerGap?: number;
		clusterPadding?: number;
	};
	ariaLabel?: string;
}

export interface PositionedNode {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	label: string;
	description?: string;
	variant: string;
	color: DiagramColor;
	state: string;
}

export interface PositionedEdge {
	from: string;
	to: string;
	path: string;
	label?: string;
	labelX: number;
	labelY: number;
	arrow: string;
	dashed: boolean;
	color: DiagramColor;
}

export interface PositionedCluster {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	label?: string;
	color: DiagramColor;
	dashed: boolean;
}

export interface PositionedSwimlane {
	id: string;
	label: string;
	x: number;
	lineX: number;
	headerY: number;
	lineY1: number;
	lineY2: number;
	color: DiagramColor;
}

export interface PositionedRegion {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	label: string;
	color: DiagramColor;
	dashed: boolean;
}

export interface PositionedAnnotation {
	text: string;
	x: number;
	y: number;
	color: DiagramColor;
}

export interface LayoutResult {
	nodes: PositionedNode[];
	edges: PositionedEdge[];
	clusters: PositionedCluster[];
	swimlanes: PositionedSwimlane[];
	regions: PositionedRegion[];
	annotations: PositionedAnnotation[];
	viewBox: { width: number; height: number };
}
