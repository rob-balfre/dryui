import type { SVGAttributes } from 'svelte/elements';
import type { DiagramConfig } from './types.js';
export interface DiagramProps extends SVGAttributes<SVGSVGElement> {
    config: DiagramConfig;
    width?: number;
    height?: number;
}
export { default as Diagram } from './diagram.svelte';
export type { DiagramConfig, DiagramNode, DiagramEdge, DiagramCluster, DiagramAnnotation, DiagramSwimlane, DiagramRegion, DiagramMessage, DiagramFragment, DiagramColor, DiagramDirection } from './types.js';
