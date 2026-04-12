import type { DiagramEdge, DiagramDirection, PositionedEdge } from './types.js';
export declare function computeEdgePaths(edges: DiagramEdge[], positions: Map<string, {
    x: number;
    y: number;
}>, nodeDims: Map<string, {
    w: number;
    h: number;
}>, direction: DiagramDirection): PositionedEdge[];
export declare function emptyEdge(edge: DiagramEdge): PositionedEdge;
