import type { HTMLAttributes } from 'svelte/elements';
import type {
	DolphinPackage,
	SystemMapEdgeKind,
	SystemMapGraph,
	SystemMapLayer,
	SystemMapNodeKind,
	SystemMapVisibility
} from './types.js';
interface Props extends HTMLAttributes<HTMLDivElement> {
	graph: SystemMapGraph;
	focusId?: string | null;
	layerFilter?: readonly SystemMapLayer[];
	kindFilter?: readonly SystemMapNodeKind[];
	edgeFilter?: readonly SystemMapEdgeKind[];
	packageFilter?: readonly DolphinPackage[];
	visibilityFilter?: readonly SystemMapVisibility[];
	categoryFilter?: readonly string[];
	showLegend?: boolean;
	showThumbnails?: boolean;
	showEdgeLabels?: boolean;
}
declare const SystemMap: import('svelte').Component<Props, {}, ''>;
type SystemMap = ReturnType<typeof SystemMap>;
export default SystemMap;
