import type { HTMLAttributes } from 'svelte/elements';
import type { DolphinEdgeType, DolphinGraph, DolphinLayer, DolphinNodeKind, DolphinPackage, DolphinVisibility } from './types.js';
export type { DolphinCluster, DolphinEdge, DolphinEdgeType, DolphinGraph, DolphinLayer, DolphinMismatch, DolphinMismatchKind, DolphinNode, DolphinNodeKind, DolphinPackage, DolphinSignals, DolphinSummary, DolphinVisibility, SystemMapEdge, SystemMapEdgeKind, SystemMapGraph, SystemMapLayer, SystemMapNode, SystemMapNodeKind, SystemMapVisibility } from './types.js';
export interface SystemMapProps extends HTMLAttributes<HTMLDivElement> {
    graph: DolphinGraph;
    focusId?: string | null;
    layerFilter?: readonly DolphinLayer[];
    kindFilter?: readonly DolphinNodeKind[];
    edgeFilter?: readonly DolphinEdgeType[];
    packageFilter?: readonly DolphinPackage[];
    visibilityFilter?: readonly DolphinVisibility[];
    categoryFilter?: readonly string[];
    showLegend?: boolean;
    showThumbnails?: boolean;
    showEdgeLabels?: boolean;
}
export { default as SystemMap } from './system-map.svelte';
