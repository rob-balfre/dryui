export type DiagramColor = 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';
export type DiagramDirection = 'TB' | 'BT' | 'LR' | 'RL';
export interface DiagramNode {
    id: string;
    label: string;
    description?: string;
    icon?: string;
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
    anchor: string | {
        x: number;
        y: number;
    };
    offset?: {
        dx?: number;
        dy?: number;
    };
    color?: DiagramColor;
}
export interface DiagramMessage {
    from: string;
    to: string;
    label: string;
    dashed?: boolean;
    color?: DiagramColor;
    arrow?: 'end' | 'start' | 'both' | 'none';
}
export interface DiagramFragment {
    id: string;
    label: string;
    condition?: string;
    messages: number[];
    color?: DiagramColor;
    dashed?: boolean;
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
    layout?: 'layered' | 'swimlane' | 'sequence';
    swimlanes?: DiagramSwimlane[];
    messages?: DiagramMessage[];
    fragments?: DiagramFragment[];
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
    icon?: string;
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
    footerY: number;
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
export interface PositionedMessage {
    from: string;
    to: string;
    label: string;
    x1: number;
    y: number;
    x2: number;
    labelX: number;
    labelY: number;
    arrow: string;
    dashed: boolean;
    color: DiagramColor;
    isSelf: boolean;
}
export interface PositionedFragment {
    id: string;
    label: string;
    condition?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: DiagramColor;
    dashed: boolean;
}
export interface PositionedLifeline {
    id: string;
    label: string;
    x: number;
    topY: number;
    bottomY: number;
    color: DiagramColor;
}
export interface LayoutResult {
    nodes: PositionedNode[];
    edges: PositionedEdge[];
    clusters: PositionedCluster[];
    swimlanes: PositionedSwimlane[];
    regions: PositionedRegion[];
    annotations: PositionedAnnotation[];
    messages: PositionedMessage[];
    lifelines: PositionedLifeline[];
    positionedFragments: PositionedFragment[];
    viewBox: {
        width: number;
        height: number;
    };
}
