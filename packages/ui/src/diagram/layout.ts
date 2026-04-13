import type {
	DiagramConfig,
	DiagramDirection,
	DiagramEdge,
	DiagramWaypoint,
	PositionedNode,
	PositionedEdge,
	PositionedCluster,
	PositionedSwimlane,
	PositionedRegion,
	PositionedAnnotation,
	PositionedMessage,
	PositionedLifeline,
	PositionedFragment,
	PositionedWaypoint,
	LayoutResult
} from './types.js';
import {
	buildPathFromCollapsed,
	computeEdgePaths,
	emptyEdge,
	getPointAtFraction,
	splitCollapsedAtBox
} from './edge-routing.js';

const DEFAULT_NODE_GAP = 32;
const DEFAULT_LAYER_GAP = 64;
const DEFAULT_CLUSTER_PADDING = 40;
const DEFAULT_CORNER_RADIUS = 8;
const DEFAULT_NODE_HEIGHT = 68;
const DESC_NODE_HEIGHT = 116;
const MIN_NODE_WIDTH = 176;
const CHAR_WIDTH = 9;
const NODE_PADDING_X = 64;
const MARGIN = 40;

// ── Helpers ────────────────────────────────────────────────

function estimateNodeWidth(label: string, description?: string): number {
	const labelWidth = label.length * CHAR_WIDTH + NODE_PADDING_X;
	const descWidth = description ? description.length * 7 + NODE_PADDING_X : 0;
	return Math.max(MIN_NODE_WIDTH, labelWidth, descWidth);
}

function isHorizontal(dir: DiagramDirection): boolean {
	return dir === 'LR' || dir === 'RL';
}

function isReversed(dir: DiagramDirection): boolean {
	return dir === 'BT' || dir === 'RL';
}

// ── Topological Sort (Kahn's) ──────────────────────────────

interface GraphData {
	adjacencyOut: Map<string, string[]>;
	adjacencyIn: Map<string, string[]>;
	order: string[];
	reversedEdges: Set<string>; // "from->to" keys for cycle-broken edges
}

function buildGraph(nodeIds: string[], edges: { from: string; to: string }[]): GraphData {
	const adjacencyOut = new Map<string, string[]>();
	const adjacencyIn = new Map<string, string[]>();
	const inDegree = new Map<string, number>();

	for (const id of nodeIds) {
		adjacencyOut.set(id, []);
		adjacencyIn.set(id, []);
		inDegree.set(id, 0);
	}

	for (const e of edges) {
		if (!adjacencyOut.has(e.from) || !adjacencyOut.has(e.to)) continue;
		adjacencyOut.get(e.from)!.push(e.to);
		adjacencyIn.get(e.to)!.push(e.from);
		inDegree.set(e.to, (inDegree.get(e.to) || 0) + 1);
	}

	// Kahn's algorithm
	const queue: string[] = [];
	for (const id of nodeIds) {
		if (inDegree.get(id) === 0) queue.push(id);
	}

	const order: string[] = [];
	const visited = new Set<string>();

	while (queue.length > 0) {
		const node = queue.shift()!;
		if (visited.has(node)) continue;
		visited.add(node);
		order.push(node);

		for (const succ of adjacencyOut.get(node)!) {
			const deg = inDegree.get(succ)! - 1;
			inDegree.set(succ, deg);
			if (deg === 0) queue.push(succ);
		}
	}

	// Handle cycles: any unvisited nodes have cycles
	const reversedEdges = new Set<string>();
	if (visited.size < nodeIds.length) {
		for (const id of nodeIds) {
			if (!visited.has(id)) {
				// Break cycle by removing an incoming edge
				const incoming = adjacencyIn.get(id)!;
				for (const src of incoming) {
					if (!visited.has(src)) {
						reversedEdges.add(`${src}->${id}`);
						const outList = adjacencyOut.get(src)!;
						const idx = outList.indexOf(id);
						if (idx >= 0) outList.splice(idx, 1);
						inDegree.set(id, (inDegree.get(id) || 1) - 1);
					}
				}
				if (!visited.has(id)) {
					visited.add(id);
					order.push(id);
				}
			}
		}
	}

	return { adjacencyOut, adjacencyIn, order, reversedEdges };
}

// ── Layer Assignment (longest-path) ────────────────────────

function assignLayers(order: string[], adjacencyOut: Map<string, string[]>): Map<string, number> {
	const layer = new Map<string, number>();
	for (const id of order) layer.set(id, 0);

	for (const id of order) {
		const currentLayer = layer.get(id)!;
		for (const succ of adjacencyOut.get(id)!) {
			layer.set(succ, Math.max(layer.get(succ)!, currentLayer + 1));
		}
	}

	return layer;
}

// ── Within-Layer Ordering (barycenter, 2 sweeps, cluster-aware) ───────────

function orderWithinLayers(
	layers: string[][],
	adjacencyOut: Map<string, string[]>,
	adjacencyIn: Map<string, string[]>,
	clusterMap?: Map<string, string>
): string[][] {
	const posInLayer = new Map<string, number>();

	// Initialize positions
	for (const layer of layers) {
		layer.forEach((id, i) => posInLayer.set(id, i));
	}

	function resortLayer(layer: string[], neighbors: Map<string, string[]>): string[] {
		const sorted = layer.map((nodeId) => {
			const adj = neighbors.get(nodeId) ?? [];
			const positions = adj
				.map((p) => posInLayer.get(p))
				.filter((p): p is number => p !== undefined);
			const barycenter =
				positions.length > 0
					? positions.reduce((a, b) => a + b, 0) / positions.length
					: (posInLayer.get(nodeId) ?? 0);
			return { id: nodeId, bary: barycenter };
		});
		sorted.sort((a, b) => a.bary - b.bary);
		return sorted.map((s) => s.id);
	}

	// Down sweep
	for (let i = 1; i < layers.length; i++) {
		const next = resortLayer(layers[i]!, adjacencyIn);
		layers[i] = next;
		next.forEach((id, j) => posInLayer.set(id, j));
	}

	// Up sweep
	for (let i = layers.length - 2; i >= 0; i--) {
		const next = resortLayer(layers[i]!, adjacencyOut);
		layers[i] = next;
		next.forEach((id, j) => posInLayer.set(id, j));
	}

	// Cluster-aware grouping: after barycenter ordering, group cluster members together
	// and push non-clustered nodes to the edges
	if (clusterMap && clusterMap.size > 0) {
		for (let i = 0; i < layers.length; i++) {
			const regrouped = groupByCluster(
				layers[i]!,
				clusterMap,
				adjacencyIn,
				adjacencyOut,
				posInLayer
			);
			layers[i] = regrouped;
			regrouped.forEach((id, j) => posInLayer.set(id, j));
		}
	}

	return layers;
}

/** Group nodes in a layer so cluster members are adjacent, non-clustered nodes at edges */
function groupByCluster(
	layer: string[],
	clusterMap: Map<string, string>,
	adjacencyIn: Map<string, string[]>,
	adjacencyOut: Map<string, string[]>,
	posInLayer: Map<string, number>
): string[] {
	if (layer.length <= 1) return layer;

	// Separate into cluster groups and non-clustered nodes
	const clusterGroups = new Map<string, string[]>();
	const nonClustered: string[] = [];

	for (const nodeId of layer) {
		const clusterId = clusterMap.get(nodeId);
		if (clusterId) {
			if (!clusterGroups.has(clusterId)) clusterGroups.set(clusterId, []);
			clusterGroups.get(clusterId)!.push(nodeId);
		} else {
			nonClustered.push(nodeId);
		}
	}

	// If no clusters in this layer, nothing to reorder
	if (clusterGroups.size === 0) return layer;
	// If no non-clustered nodes, just keep cluster groups in barycenter order
	if (nonClustered.length === 0) {
		// Order cluster groups by average barycenter position of their members
		const groups = [...clusterGroups.entries()].map(([cid, nodes]) => {
			const avgPos = nodes.reduce((s, n) => s + (posInLayer.get(n) ?? 0), 0) / nodes.length;
			return { cid, nodes, avgPos };
		});
		groups.sort((a, b) => a.avgPos - b.avgPos);
		return groups.flatMap((g) => g.nodes);
	}

	// Compute average barycenter position for each cluster group
	const groupEntries = [...clusterGroups.entries()].map(([cid, nodes]) => {
		const avgPos = nodes.reduce((s, n) => s + (posInLayer.get(n) ?? 0), 0) / nodes.length;
		return { cid, nodes, avgPos };
	});
	groupEntries.sort((a, b) => a.avgPos - b.avgPos);

	// Compute average connected position for non-clustered nodes to decide
	// whether they go before or after the cluster groups
	const allClusterPositions = groupEntries.flatMap((g) =>
		g.nodes.map((n) => posInLayer.get(n) ?? 0)
	);
	const clusterCenter = allClusterPositions.reduce((a, b) => a + b, 0) / allClusterPositions.length;

	// Split non-clustered into before/after based on their barycenter relative to cluster center
	const before: string[] = [];
	const after: string[] = [];
	for (const nodeId of nonClustered) {
		const pos = posInLayer.get(nodeId) ?? 0;
		if (pos <= clusterCenter) {
			before.push(nodeId);
		} else {
			after.push(nodeId);
		}
	}
	// If all ended up on one side, that's fine — just keep them there
	// If none on either side, push all to the end
	if (before.length === 0 && after.length === 0) {
		after.push(...nonClustered);
	}

	return [...before, ...groupEntries.flatMap((g) => g.nodes), ...after];
}

// ── Coordinate Assignment ──────────────────────────────────

const CLUSTER_GROUP_GAP = 40;

function assignCoordinates(
	layers: string[][],
	nodeDims: Map<string, { w: number; h: number }>,
	direction: DiagramDirection,
	nodeGap: number,
	layerGap: number,
	clusterMap?: Map<string, string>
): Map<string, { x: number; y: number }> {
	const positions = new Map<string, { x: number; y: number }>();
	const horizontal = isHorizontal(direction);
	const reversed = isReversed(direction);

	// Compute layer extents (max node size in layer direction)
	const layerSizes: number[] = [];
	for (const layer of layers) {
		let maxSize = 0;
		for (const id of layer) {
			const dims = nodeDims.get(id)!;
			maxSize = Math.max(maxSize, horizontal ? dims.w : dims.h);
		}
		layerSizes.push(maxSize);
	}

	// Find max cross-axis extent per layer for centering (including cluster group gaps)
	const layerCrossExtents: number[] = [];
	for (const layer of layers) {
		let total = 0;
		for (const id of layer) {
			const dims = nodeDims.get(id)!;
			total += horizontal ? dims.h : dims.w;
		}
		total += (layer.length - 1) * nodeGap;
		// Add extra gap at cluster/non-cluster boundaries
		if (clusterMap && clusterMap.size > 0) {
			total += countClusterBoundaries(layer, clusterMap) * CLUSTER_GROUP_GAP;
		}
		layerCrossExtents.push(total);
	}
	const maxCrossExtent = Math.max(...layerCrossExtents);

	// Assign positions
	let layerOffset = MARGIN;
	const layerOrder = reversed ? [...layers].reverse() : layers;
	const sizeOrder = reversed ? [...layerSizes].reverse() : layerSizes;

	for (let li = 0; li < layerOrder.length; li++) {
		const layer = layerOrder[li]!;
		const layerSize = sizeOrder[li]!;

		// Center this layer's nodes
		const crossExtent = layerCrossExtents[reversed ? layerOrder.length - 1 - li : li] ?? 0;
		let crossOffset = MARGIN + (maxCrossExtent - crossExtent) / 2;

		for (let ni = 0; ni < layer.length; ni++) {
			const id = layer[ni]!;
			const dims = nodeDims.get(id)!;
			const primaryOffset = reversed ? (horizontal ? layerSize - dims.w : layerSize - dims.h) : 0;

			// Add extra gap at cluster/non-cluster boundary
			if (ni > 0 && clusterMap && clusterMap.size > 0) {
				const prevCluster = clusterMap.get(layer[ni - 1]!);
				const currCluster = clusterMap.get(id);
				if (
					prevCluster !== currCluster &&
					(prevCluster !== undefined || currCluster !== undefined)
				) {
					crossOffset += CLUSTER_GROUP_GAP;
				}
			}

			if (horizontal) {
				positions.set(id, {
					x: layerOffset + primaryOffset,
					y: crossOffset
				});
				crossOffset += dims.h + nodeGap;
			} else {
				positions.set(id, {
					x: crossOffset,
					y: layerOffset + primaryOffset
				});
				crossOffset += dims.w + nodeGap;
			}
		}

		layerOffset += layerSize + layerGap;
	}

	return positions;
}

/** Count how many cluster/non-cluster boundaries exist in a layer ordering */
function countClusterBoundaries(layer: string[], clusterMap: Map<string, string>): number {
	let count = 0;
	for (let i = 1; i < layer.length; i++) {
		const prevCluster = clusterMap.get(layer[i - 1]!);
		const currCluster = clusterMap.get(layer[i]!);
		if (prevCluster !== currCluster && (prevCluster !== undefined || currCluster !== undefined)) {
			count++;
		}
	}
	return count;
}

// ── Cluster Bounds ─────────────────────────────────────────

function computeClusterBounds(
	config: DiagramConfig,
	positions: Map<string, { x: number; y: number }>,
	nodeDims: Map<string, { w: number; h: number }>,
	padding: number
): PositionedCluster[] {
	if (!config.clusters) return [];

	return config.clusters.map((cluster) => {
		let minX = Infinity,
			minY = Infinity,
			maxX = -Infinity,
			maxY = -Infinity;

		for (const nodeId of cluster.nodes) {
			const pos = positions.get(nodeId);
			const dims = nodeDims.get(nodeId);
			if (!pos || !dims) continue;
			minX = Math.min(minX, pos.x);
			minY = Math.min(minY, pos.y);
			maxX = Math.max(maxX, pos.x + dims.w);
			maxY = Math.max(maxY, pos.y + dims.h);
		}

		if (minX === Infinity) {
			return {
				id: cluster.id,
				x: 0,
				y: 0,
				width: 0,
				height: 0,
				label: cluster.label,
				iconComponent: cluster.iconComponent,
				color: cluster.color || 'neutral',
				dashed: cluster.dashed ?? true
			};
		}

		// Add space for label above
		const labelPad = cluster.label ? 24 : 0;

		return {
			id: cluster.id,
			x: minX - padding,
			y: minY - padding - labelPad,
			width: maxX - minX + padding * 2,
			height: maxY - minY + padding * 2 + labelPad,
			label: cluster.label,
			iconComponent: cluster.iconComponent,
			color: cluster.color || 'neutral',
			dashed: cluster.dashed ?? true
		};
	});
}

function computeNodeAndClusterBounds(
	nodes: PositionedNode[],
	clusters: PositionedCluster[]
): { minX: number; minY: number; maxX: number; maxY: number } {
	let minX = Infinity,
		minY = Infinity,
		maxX = -Infinity,
		maxY = -Infinity;

	for (const n of nodes) {
		minX = Math.min(minX, n.x);
		minY = Math.min(minY, n.y);
		maxX = Math.max(maxX, n.x + n.width);
		maxY = Math.max(maxY, n.y + n.height);
	}
	for (const c of clusters) {
		minX = Math.min(minX, c.x);
		minY = Math.min(minY, c.y);
		maxX = Math.max(maxX, c.x + c.width);
		maxY = Math.max(maxY, c.y + c.height);
	}

	if (minX === Infinity) {
		return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
	}
	return { minX, minY, maxX, maxY };
}

// ── Waypoints ──────────────────────────────────────────────

const WAYPOINT_DEFAULT_WIDTH = 240;
const WAYPOINT_DEFAULT_HEIGHT_DESC = 132;
const WAYPOINT_DEFAULT_HEIGHT = 84;

function estimateWaypointDims(waypoint: DiagramWaypoint): { w: number; h: number } {
	const w =
		waypoint.width ??
		Math.max(
			MIN_NODE_WIDTH,
			waypoint.label.length * CHAR_WIDTH + NODE_PADDING_X,
			(waypoint.description?.length ?? 0) * 7 + NODE_PADDING_X
		);
	const h =
		waypoint.height ??
		(waypoint.description ? WAYPOINT_DEFAULT_HEIGHT_DESC : WAYPOINT_DEFAULT_HEIGHT);
	return { w: Math.min(w, WAYPOINT_DEFAULT_WIDTH * 1.4), h };
}

function placeWaypoints(
	configEdges: DiagramEdge[],
	positionedEdges: PositionedEdge[],
	collapsedByIndex: (Array<{ x: number; y: number }> | null)[],
	cornerRadius: number
): { edges: PositionedEdge[]; waypoints: PositionedWaypoint[] } {
	const newEdges: PositionedEdge[] = [];
	const waypoints: PositionedWaypoint[] = [];

	configEdges.forEach((edge, i) => {
		const positioned = positionedEdges[i];
		const collapsed = collapsedByIndex[i];
		if (!edge.waypoint || !positioned || !collapsed || collapsed.length < 2) {
			if (positioned) newEdges.push(positioned);
			return;
		}

		const wp = edge.waypoint;
		const t = wp.position ?? 0.5;
		const at = getPointAtFraction(collapsed, t);
		const dims = estimateWaypointDims(wp);

		// Snap box center to the segment axis so the polyline enters/exits cleanly
		const boxCenter =
			at.axis === 'h'
				? { x: at.point.x, y: at.point.y } // horizontal segment — box vertical center on the line
				: { x: at.point.x, y: at.point.y };
		const box = {
			x: boxCenter.x - dims.w / 2,
			y: boxCenter.y - dims.h / 2,
			width: dims.w,
			height: dims.h
		};

		const split = splitCollapsedAtBox(collapsed, at.segmentIndex, box, at.axis);
		if (!split) {
			newEdges.push(positioned);
			return;
		}

		const entryPath = buildPathFromCollapsed(split.entry, cornerRadius);
		const exitPath = buildPathFromCollapsed(split.exit, cornerRadius);

		// Entry segment: no arrow marker (arrow is on the exit)
		newEdges.push({
			...positioned,
			path: entryPath,
			label: undefined,
			labelX: 0,
			labelY: 0,
			arrow: 'none',
			kind: 'entry'
		});
		// Exit segment: keeps original arrow + label
		const exitMid = getPointAtFraction(split.exit, 0.5).point;
		newEdges.push({
			...positioned,
			path: exitPath,
			label: positioned.label,
			labelX: exitMid.x,
			labelY: exitMid.y - 12,
			kind: 'exit'
		});

		waypoints.push({
			id: wp.id ?? `${edge.from}->${edge.to}`,
			x: box.x,
			y: box.y,
			width: dims.w,
			height: dims.h,
			label: wp.label,
			description: wp.description,
			icon: wp.icon,
			iconComponent: wp.iconComponent,
			variant: wp.variant ?? 'default',
			color: wp.color ?? 'neutral'
		});
	});

	return { edges: newEdges, waypoints };
}

// ── Annotations ────────────────────────────────────────────

const ANNOTATION_CHAR_WIDTH = 6;
const ANNOTATION_HEIGHT = 14;
const ANNOTATION_COLLISION_PAD = 20;

function resolveAnnotations(
	config: DiagramConfig,
	positions: Map<string, { x: number; y: number }>,
	nodeDims: Map<string, { w: number; h: number }>
): PositionedAnnotation[] {
	if (!config.annotations) return [];

	const resolved: PositionedAnnotation[] = config.annotations.map((ann) => {
		let x: number, y: number;

		if (typeof ann.anchor === 'string') {
			const pos = positions.get(ann.anchor);
			const dims = nodeDims.get(ann.anchor);
			if (pos && dims) {
				x = pos.x + dims.w / 2;
				y = pos.y - 12;
			} else {
				x = 0;
				y = 0;
			}
		} else {
			x = ann.anchor.x;
			y = ann.anchor.y;
		}

		return {
			text: ann.text,
			x: x + (ann.offset?.dx ?? 0),
			y: y + (ann.offset?.dy ?? 0),
			color: ann.color || 'neutral'
		};
	});

	// Collision avoidance: check annotations against nodes and other annotations
	for (let i = 0; i < resolved.length; i++) {
		const ann = resolved[i]!;
		const annW = ann.text.length * ANNOTATION_CHAR_WIDTH;
		const annH = ANNOTATION_HEIGHT;

		// Check against all nodes — shift upward if overlapping
		let shifted = true;
		let maxIter = 10; // prevent infinite loop
		while (shifted && maxIter-- > 0) {
			shifted = false;
			for (const [nodeId, pos] of positions) {
				const dims = nodeDims.get(nodeId);
				if (!dims) continue;
				// Check overlap with padding
				if (
					ann.x + annW > pos.x - ANNOTATION_COLLISION_PAD &&
					ann.x < pos.x + dims.w + ANNOTATION_COLLISION_PAD &&
					ann.y + annH > pos.y - ANNOTATION_COLLISION_PAD &&
					ann.y < pos.y + dims.h + ANNOTATION_COLLISION_PAD
				) {
					// Shift annotation above the node
					ann.y = pos.y - ANNOTATION_COLLISION_PAD - annH;
					shifted = true;
				}
			}
		}

		// Check against previously placed annotations
		for (let j = 0; j < i; j++) {
			const other = resolved[j]!;
			const otherW = other.text.length * ANNOTATION_CHAR_WIDTH;
			const otherH = ANNOTATION_HEIGHT;
			if (
				ann.x + annW > other.x - ANNOTATION_COLLISION_PAD &&
				ann.x < other.x + otherW + ANNOTATION_COLLISION_PAD &&
				ann.y + annH > other.y - ANNOTATION_COLLISION_PAD &&
				ann.y < other.y + otherH + ANNOTATION_COLLISION_PAD
			) {
				// Shift this annotation above the other
				ann.y = other.y - ANNOTATION_COLLISION_PAD - annH;
			}
		}
	}

	return resolved;
}

// ── Layered Layout (main entry) ────────────────────────────

function layoutLayered(config: DiagramConfig): LayoutResult {
	const direction = config.direction || 'TB';
	const nodeGap = config.spacing?.nodeGap ?? DEFAULT_NODE_GAP;
	const layerGap = config.spacing?.layerGap ?? DEFAULT_LAYER_GAP;
	const clusterPadding = config.spacing?.clusterPadding ?? DEFAULT_CLUSTER_PADDING;
	const cornerRadius = config.spacing?.cornerRadius ?? DEFAULT_CORNER_RADIUS;

	const nodeIds = config.nodes.map((n) => n.id);
	const nodeDims = buildNodeDims(config.nodes);

	// Build cluster membership map: nodeId -> clusterId
	const clusterMap = buildClusterMap(config);

	// Build graph and sort
	const graph = buildGraph(nodeIds, config.edges);

	// Assign layers
	const layerMap = assignLayers(graph.order, graph.adjacencyOut);

	// Group by layer
	const maxLayer = Math.max(0, ...layerMap.values());
	const layers: string[][] = Array.from({ length: maxLayer + 1 }, () => []);
	for (const id of graph.order) {
		layers[layerMap.get(id)!]!.push(id);
	}

	// Order within layers (cluster-aware)
	const orderedLayers = orderWithinLayers(
		layers,
		graph.adjacencyOut,
		graph.adjacencyIn,
		clusterMap
	);

	// Assign coordinates (cluster-aware gaps)
	const positions = assignCoordinates(
		orderedLayers,
		nodeDims,
		direction,
		nodeGap,
		layerGap,
		clusterMap
	);

	// Build positioned nodes
	const positionedNodes = buildPositionedNodes(config.nodes, positions, nodeDims);

	// Compute clusters
	const clusters = computeClusterBounds(config, positions, nodeDims, clusterPadding);

	// Pre-edge bounds (used by back-edge router to anchor outer lanes)
	const preBounds = computeNodeAndClusterBounds(positionedNodes, clusters);

	// Compute edges (back edges route around preBounds)
	const computed = computeEdgePaths(
		config.edges,
		positions,
		nodeDims,
		direction,
		cornerRadius,
		graph.reversedEdges,
		preBounds
	);
	let positionedEdges = computed.edges;

	// Place waypoints (post-process: split edges that have waypoints)
	const waypointResult = placeWaypoints(
		config.edges,
		positionedEdges,
		computed.collapsed,
		cornerRadius
	);
	positionedEdges = waypointResult.edges;
	const waypoints = waypointResult.waypoints;

	// Compute annotations
	const annotations = resolveAnnotations(config, positions, nodeDims);

	// Compute viewBox with full bounds coverage
	let minX = Infinity,
		minY = Infinity,
		maxX = -Infinity,
		maxY = -Infinity;

	// Include all node bounds
	for (const n of positionedNodes) {
		minX = Math.min(minX, n.x);
		minY = Math.min(minY, n.y);
		maxX = Math.max(maxX, n.x + n.width);
		maxY = Math.max(maxY, n.y + n.height);
	}

	// Include all cluster bounds
	for (const c of clusters) {
		minX = Math.min(minX, c.x);
		minY = Math.min(minY, c.y);
		maxX = Math.max(maxX, c.x + c.width);
		maxY = Math.max(maxY, c.y + c.height);
	}

	// Include annotation positions (estimated text width)
	for (const ann of annotations) {
		const annW = ann.text.length * ANNOTATION_CHAR_WIDTH;
		minX = Math.min(minX, ann.x);
		minY = Math.min(minY, ann.y - ANNOTATION_HEIGHT);
		maxX = Math.max(maxX, ann.x + annW);
		maxY = Math.max(maxY, ann.y);
	}

	// Include edge label positions (estimated text width)
	for (const e of positionedEdges) {
		if (e.label) {
			const labelW = e.label.length * 5;
			minX = Math.min(minX, e.labelX - labelW / 2);
			minY = Math.min(minY, e.labelY - 7);
			maxX = Math.max(maxX, e.labelX + labelW / 2);
			maxY = Math.max(maxY, e.labelY + 7);
		}
		// Back-edge paths can extend outside the node bbox; expand viewBox to fit
		const pathBounds = extractPathBounds(e.path);
		if (pathBounds) {
			minX = Math.min(minX, pathBounds.minX);
			minY = Math.min(minY, pathBounds.minY);
			maxX = Math.max(maxX, pathBounds.maxX);
			maxY = Math.max(maxY, pathBounds.maxY);
		}
	}

	// Handle empty diagram
	if (minX === Infinity) {
		minX = 0;
		minY = 0;
		maxX = MARGIN * 2;
		maxY = MARGIN * 2;
	}

	// Include waypoint bounds
	for (const w of waypoints) {
		minX = Math.min(minX, w.x);
		minY = Math.min(minY, w.y);
		maxX = Math.max(maxX, w.x + w.width);
		maxY = Math.max(maxY, w.y + w.height);
	}

	// Shift everything so all coordinates are non-negative
	const shiftX = minX < 0 ? -minX + MARGIN : 0;
	const shiftY = minY < 0 ? -minY + MARGIN : 0;

	if (shiftX > 0 || shiftY > 0) {
		shiftAllPositions(positionedNodes, clusters, annotations, positionedEdges, shiftX, shiftY);
		for (const w of waypoints) {
			w.x += shiftX;
			w.y += shiftY;
		}
		maxX += shiftX;
		maxY += shiftY;
	}

	return {
		nodes: positionedNodes,
		edges: positionedEdges,
		clusters,
		swimlanes: [],
		regions: [],
		annotations,
		messages: [],
		lifelines: [],
		positionedFragments: [],
		waypoints,
		viewBox: { width: maxX + MARGIN, height: maxY + MARGIN }
	};
}

// ── Swimlane Layout ────────────────────────────────────────

function layoutSwimlane(config: DiagramConfig): LayoutResult {
	const nodeGap = config.spacing?.nodeGap ?? 32;
	const lanes = config.swimlanes || [];
	const nodeDims = buildNodeDims(config.nodes);
	const headerHeight = 50;

	// Assign lanes
	const laneMap = new Map<string, number>();
	for (let i = 0; i < lanes.length; i++) {
		for (const nid of lanes[i]!.nodes) {
			laneMap.set(nid, i);
		}
	}

	// Compute dynamic lane widths: max(180, widest node in lane + 40)
	const laneWidths: number[] = lanes.map((lane) => {
		let maxW = 0;
		for (const nid of lane.nodes) {
			const dims = nodeDims.get(nid);
			if (dims) maxW = Math.max(maxW, dims.w);
		}
		return Math.max(180, maxW + 40);
	});

	// Compute lane start X offsets
	const laneStartX: number[] = [];
	let laneX = MARGIN;
	for (let i = 0; i < laneWidths.length; i++) {
		laneStartX.push(laneX);
		laneX += laneWidths[i]!;
	}

	// Topological order for Y positions
	const nodeIds = config.nodes.map((n) => n.id);
	const graph = buildGraph(nodeIds, config.edges);

	// Assign Y positions sequentially
	const positions = new Map<string, { x: number; y: number }>();
	let currentY = MARGIN + headerHeight + 20;

	for (const id of graph.order) {
		const laneIdx = laneMap.get(id) ?? 0;
		const dims = nodeDims.get(id)!;
		const lw = laneWidths[laneIdx] ?? 180;
		const startX = laneStartX[laneIdx] ?? MARGIN;
		const x = startX + (lw - dims.w) / 2;
		positions.set(id, { x, y: currentY });
		currentY += dims.h + nodeGap;
	}

	const totalHeight = currentY + MARGIN;
	const totalWidth = MARGIN + laneX;

	const positionedNodes = buildPositionedNodes(config.nodes, positions, nodeDims);

	// Build swimlane positioned data
	const positionedSwimlanes: PositionedSwimlane[] = lanes.map((lane, i) => ({
		id: lane.id,
		label: lane.label,
		x: laneStartX[i]!,
		lineX: laneStartX[i]! + laneWidths[i]! / 2,
		headerY: MARGIN,
		footerY: totalHeight - MARGIN,
		lineY1: MARGIN + headerHeight,
		lineY2: totalHeight - MARGIN,
		color: lane.color || 'neutral'
	}));

	// Edges: horizontal arrows between lanes
	const positionedEdges = computeSwimEdgePaths(
		config.edges,
		positions,
		nodeDims,
		laneMap,
		laneWidths[0] ?? 180
	);

	// Regions
	const positionedRegions: PositionedRegion[] = (config.regions || []).map((region) => {
		let minY = Infinity,
			maxY = -Infinity;
		let minLane = Infinity,
			maxLane = -Infinity;

		for (const nid of region.contains) {
			const pos = positions.get(nid);
			const dims = nodeDims.get(nid);
			const laneIdx = laneMap.get(nid);
			if (pos && dims) {
				minY = Math.min(minY, pos.y);
				maxY = Math.max(maxY, pos.y + dims.h);
			}
			if (laneIdx !== undefined) {
				minLane = Math.min(minLane, laneIdx);
				maxLane = Math.max(maxLane, laneIdx);
			}
		}

		if (minY === Infinity) {
			return {
				id: region.id,
				x: 0,
				y: 0,
				width: 0,
				height: 0,
				label: region.label,
				color: region.color || 'neutral',
				dashed: region.dashed ?? true
			};
		}

		const pad = 16;
		const regionX = laneStartX[minLane]! - pad;
		let regionEndX = laneStartX[maxLane]! + laneWidths[maxLane]! + pad;
		return {
			id: region.id,
			x: regionX,
			y: minY - pad - 20,
			width: regionEndX - regionX,
			height: maxY - minY + pad * 2 + 20,
			label: region.label,
			color: region.color || 'neutral',
			dashed: region.dashed ?? true
		};
	});

	// Annotations
	const annotations = resolveAnnotations(config, positions, nodeDims);

	// Compute viewBox with full bounds coverage
	let minX = Infinity,
		minY = Infinity,
		maxViewX = -Infinity,
		maxViewY = -Infinity;

	for (const n of positionedNodes) {
		minX = Math.min(minX, n.x);
		minY = Math.min(minY, n.y);
		maxViewX = Math.max(maxViewX, n.x + n.width);
		maxViewY = Math.max(maxViewY, n.y + n.height);
	}

	// Include swimlane headers
	for (let si = 0; si < positionedSwimlanes.length; si++) {
		const sl = positionedSwimlanes[si]!;
		minX = Math.min(minX, sl.x);
		minY = Math.min(minY, sl.headerY);
		maxViewX = Math.max(maxViewX, sl.x + (laneWidths[si] ?? 180));
		maxViewY = Math.max(maxViewY, sl.lineY2);
	}

	// Include annotation positions
	for (const ann of annotations) {
		const annW = ann.text.length * ANNOTATION_CHAR_WIDTH;
		minX = Math.min(minX, ann.x);
		minY = Math.min(minY, ann.y - ANNOTATION_HEIGHT);
		maxViewX = Math.max(maxViewX, ann.x + annW);
		maxViewY = Math.max(maxViewY, ann.y);
	}

	// Include edge labels
	for (const e of positionedEdges) {
		if (e.label) {
			const labelW = e.label.length * 5;
			minX = Math.min(minX, e.labelX - labelW / 2);
			minY = Math.min(minY, e.labelY - 7);
			maxViewX = Math.max(maxViewX, e.labelX + labelW / 2);
			maxViewY = Math.max(maxViewY, e.labelY + 7);
		}
	}

	// Include regions
	for (const r of positionedRegions) {
		minX = Math.min(minX, r.x);
		minY = Math.min(minY, r.y);
		maxViewX = Math.max(maxViewX, r.x + r.width);
		maxViewY = Math.max(maxViewY, r.y + r.height);
	}

	// Handle empty diagram
	if (minX === Infinity) {
		minX = 0;
		minY = 0;
		maxViewX = totalWidth;
		maxViewY = totalHeight;
	}

	// Shift everything so all coordinates are non-negative
	const shiftX = minX < 0 ? -minX + MARGIN : 0;
	const shiftY = minY < 0 ? -minY + MARGIN : 0;

	if (shiftX > 0 || shiftY > 0) {
		shiftAllPositions(positionedNodes, [], annotations, positionedEdges, shiftX, shiftY);
		// Also shift swimlanes and regions
		for (const sl of positionedSwimlanes) {
			sl.x += shiftX;
			sl.lineX += shiftX;
			sl.headerY += shiftY;
			sl.lineY1 += shiftY;
			sl.lineY2 += shiftY;
		}
		for (const r of positionedRegions) {
			r.x += shiftX;
			r.y += shiftY;
		}
		maxViewX += shiftX;
		maxViewY += shiftY;
	}

	return {
		nodes: positionedNodes,
		edges: positionedEdges,
		clusters: [],
		swimlanes: positionedSwimlanes,
		regions: positionedRegions,
		annotations,
		messages: [],
		lifelines: [],
		positionedFragments: [],
		waypoints: [],
		viewBox: {
			width: Math.max(totalWidth, maxViewX + MARGIN),
			height: Math.max(totalHeight, maxViewY + MARGIN)
		}
	};
}

// ── Shared Helpers ─────────────────────────────────────────

/** Build a map from nodeId -> clusterId for cluster-aware ordering */
function buildClusterMap(config: DiagramConfig): Map<string, string> {
	const map = new Map<string, string>();
	if (!config.clusters) return map;
	for (const cluster of config.clusters) {
		for (const nodeId of cluster.nodes) {
			map.set(nodeId, cluster.id);
		}
	}
	return map;
}

/** Shift all positioned elements by (dx, dy) to ensure non-negative coordinates */
function shiftAllPositions(
	nodes: PositionedNode[],
	clusters: PositionedCluster[],
	annotations: PositionedAnnotation[],
	edges: PositionedEdge[],
	dx: number,
	dy: number
): void {
	for (const n of nodes) {
		n.x += dx;
		n.y += dy;
	}
	for (const c of clusters) {
		c.x += dx;
		c.y += dy;
	}
	for (const a of annotations) {
		a.x += dx;
		a.y += dy;
	}
	for (const e of edges) {
		e.labelX += dx;
		e.labelY += dy;
		// Shift SVG path coordinates
		e.path = shiftSvgPath(e.path, dx, dy);
	}
}

/** Extract min/max x/y from an SVG path string (absolute commands only).
 * Used to expand viewBox to include back-edge paths that extend beyond node bounds.
 */
function extractPathBounds(
	path: string
): { minX: number; minY: number; maxX: number; maxY: number } | null {
	if (!path) return null;
	let minX = Infinity,
		minY = Infinity,
		maxX = -Infinity,
		maxY = -Infinity;
	const matches = path.matchAll(/[MLQTSC]([^MLQTSCAHVZmlqtscahvz]*)/g);
	for (const match of matches) {
		const args = match[1] ?? '';
		const nums = args.match(/-?\d+(?:\.\d+)?/g);
		if (!nums) continue;
		for (let i = 0; i + 1 < nums.length; i += 2) {
			const x = parseFloat(nums[i]!);
			const y = parseFloat(nums[i + 1]!);
			if (x < minX) minX = x;
			if (x > maxX) maxX = x;
			if (y < minY) minY = y;
			if (y > maxY) maxY = y;
		}
	}
	if (minX === Infinity) return null;
	return { minX, minY, maxX, maxY };
}

/** Shift all absolute coordinates in an SVG path string by (dx, dy).
 * Handles multi-pair commands (Q, C, S, T) where the args contain more than one (x, y).
 */
function shiftSvgPath(path: string, dx: number, dy: number): string {
	return path.replace(
		/([MLQTSC])([^MLQTSCAHVZmlqtscahvz]*)/g,
		(_match, cmd: string, args: string) => {
			const nums = args.match(/-?\d+(?:\.\d+)?/g);
			if (!nums || nums.length === 0) return cmd;
			const shifted = nums.map((n, i) => {
				const v = parseFloat(n);
				return (i % 2 === 0 ? v + dx : v + dy).toString();
			});
			return `${cmd} ${shifted.join(' ')}`;
		}
	);
}

function buildNodeDims(nodes: DiagramConfig['nodes']): Map<string, { w: number; h: number }> {
	const dims = new Map<string, { w: number; h: number }>();
	for (const node of nodes) {
		const w = node.width ?? estimateNodeWidth(node.label, node.description);
		const h = node.height ?? (node.description ? DESC_NODE_HEIGHT : DEFAULT_NODE_HEIGHT);
		dims.set(node.id, { w, h });
	}
	return dims;
}

function buildPositionedNodes(
	nodes: DiagramConfig['nodes'],
	positions: Map<string, { x: number; y: number }>,
	nodeDims: Map<string, { w: number; h: number }>
): PositionedNode[] {
	return nodes.map((node) => {
		const pos = positions.get(node.id) || { x: 0, y: 0 };
		const dims = nodeDims.get(node.id)!;
		return {
			id: node.id,
			x: pos.x,
			y: pos.y,
			width: dims.w,
			height: dims.h,
			label: node.label,
			description: node.description,
			icon: node.icon,
			iconComponent: node.iconComponent,
			variant: node.variant || 'default',
			color: node.color || 'neutral',
			state: node.state || 'default'
		};
	});
}

// ── Swimlane Edge Paths ────────────────────────────────────

function computeSwimEdgePaths(
	edges: DiagramConfig['edges'],
	positions: Map<string, { x: number; y: number }>,
	nodeDims: Map<string, { w: number; h: number }>,
	laneMap: Map<string, number>,
	laneWidth: number
): PositionedEdge[] {
	return edges.map((edge) => {
		const fromPos = positions.get(edge.from);
		const toPos = positions.get(edge.to);
		const fromDims = nodeDims.get(edge.from);
		const toDims = nodeDims.get(edge.to);

		if (!fromPos || !toPos || !fromDims || !toDims) {
			return emptyEdge(edge);
		}

		const fromLane = laneMap.get(edge.from) ?? 0;
		const toLane = laneMap.get(edge.to) ?? 0;

		let path: string;
		let labelX: number;
		let labelY: number;

		if (fromLane === toLane) {
			// Same lane: vertical arrow
			const cx = fromPos.x + fromDims.w / 2;
			const y1 = fromPos.y + fromDims.h;
			const y2 = toPos.y;
			path = `M ${cx} ${y1} L ${cx} ${y2}`;
			labelX = cx + 10;
			labelY = (y1 + y2) / 2;
		} else {
			// Cross-lane: horizontal arrow at midpoint Y
			const midY = fromPos.y + fromDims.h / 2;
			const x1 = fromLane < toLane ? fromPos.x + fromDims.w : fromPos.x;
			const x2 = fromLane < toLane ? toPos.x : toPos.x + toDims.w;
			path = `M ${x1} ${midY} L ${x2} ${midY}`;
			labelX = (x1 + x2) / 2;
			labelY = midY - 8;
		}

		return {
			from: edge.from,
			to: edge.to,
			path,
			label: edge.label,
			labelX,
			labelY,
			arrow: edge.arrow || 'end',
			dashed: edge.dashed || false,
			color: edge.color || 'neutral'
		};
	});
}

// ── Public API ─────────────────────────────────────────────

// ── Sequence Layout ───────────────────────────────────────

const SEQ_ACTOR_GAP = 180;
const SEQ_MESSAGE_GAP = 40;
const SEQ_ACTOR_BOX_HEIGHT = 36;
const SEQ_TOP_MARGIN = 40;
const SEQ_SELF_LOOP_WIDTH = 30;
const SEQ_SELF_LOOP_HEIGHT = 24;
const SEQ_FRAGMENT_PAD_X = 20;
const SEQ_FRAGMENT_PAD_Y = 16;
const SEQ_FRAGMENT_TAG_HEIGHT = 20;

function layoutSequence(config: DiagramConfig): LayoutResult {
	const actors = config.nodes;
	const messages = config.messages || [];
	const fragments = config.fragments || [];

	// Position actors evenly across the x-axis
	const actorXMap = new Map<string, number>();
	const actorColorMap = new Map<string, string>();
	for (let i = 0; i < actors.length; i++) {
		const actor = actors[i]!;
		const x = MARGIN + i * SEQ_ACTOR_GAP + SEQ_ACTOR_GAP / 2;
		actorXMap.set(actor.id, x);
		actorColorMap.set(actor.id, actor.color || 'neutral');
	}

	// Compute message Y positions (increment per message)
	const messageStartY = SEQ_TOP_MARGIN + SEQ_ACTOR_BOX_HEIGHT + 30;
	const messageYPositions: number[] = [];
	let currentY = messageStartY;
	for (let i = 0; i < messages.length; i++) {
		const msg = messages[i]!;
		messageYPositions.push(currentY);
		const isSelf = msg.from === msg.to;
		currentY += isSelf ? SEQ_MESSAGE_GAP + SEQ_SELF_LOOP_HEIGHT : SEQ_MESSAGE_GAP;
	}

	// Bottom of the diagram
	const bottomY = currentY + 30 + SEQ_ACTOR_BOX_HEIGHT;
	const totalHeight = bottomY + MARGIN;
	const totalWidth = MARGIN * 2 + actors.length * SEQ_ACTOR_GAP;

	// Build lifelines
	const lifelines: PositionedLifeline[] = actors.map((actor) => ({
		id: actor.id,
		label: actor.label,
		x: actorXMap.get(actor.id)!,
		topY: SEQ_TOP_MARGIN,
		bottomY: bottomY,
		color: (actor.color || 'neutral') as PositionedLifeline['color']
	}));

	// Build positioned messages
	const positionedMessages: PositionedMessage[] = messages.map((msg, i) => {
		const fromX = actorXMap.get(msg.from) ?? 0;
		const toX = actorXMap.get(msg.to) ?? 0;
		const y = messageYPositions[i] ?? messageStartY;
		const isSelf = msg.from === msg.to;

		let labelX: number;
		let labelY: number;

		if (isSelf) {
			labelX = fromX + SEQ_SELF_LOOP_WIDTH + 8;
			labelY = y + SEQ_SELF_LOOP_HEIGHT / 2;
		} else {
			labelX = (fromX + toX) / 2;
			labelY = y - 8;
		}

		return {
			from: msg.from,
			to: msg.to,
			label: msg.label,
			x1: fromX,
			y,
			x2: toX,
			labelX,
			labelY,
			arrow: msg.arrow || 'end',
			dashed: msg.dashed || false,
			color: (msg.color || 'neutral') as PositionedMessage['color'],
			isSelf
		};
	});

	// Build positioned fragments
	const positionedFragments: PositionedFragment[] = fragments.map((frag) => {
		if (frag.messages.length === 0) {
			return {
				id: frag.id,
				label: frag.label,
				condition: frag.condition,
				x: 0,
				y: 0,
				width: 0,
				height: 0,
				color: (frag.color || 'neutral') as PositionedFragment['color'],
				dashed: frag.dashed ?? false
			};
		}

		// Find bounds from contained messages
		let minX = Infinity;
		let maxX = -Infinity;
		let minY = Infinity;
		let maxY = -Infinity;

		for (const msgIdx of frag.messages) {
			if (msgIdx < 0 || msgIdx >= positionedMessages.length) continue;
			const msg = positionedMessages[msgIdx]!;
			const leftX = Math.min(msg.x1, msg.x2);
			const rightX = msg.isSelf ? msg.x1 + SEQ_SELF_LOOP_WIDTH : Math.max(msg.x1, msg.x2);
			minX = Math.min(minX, leftX);
			maxX = Math.max(maxX, rightX);
			minY = Math.min(minY, msg.y);
			maxY = Math.max(maxY, msg.isSelf ? msg.y + SEQ_SELF_LOOP_HEIGHT : msg.y);
		}

		if (minX === Infinity) {
			return {
				id: frag.id,
				label: frag.label,
				condition: frag.condition,
				x: 0,
				y: 0,
				width: 0,
				height: 0,
				color: (frag.color || 'neutral') as PositionedFragment['color'],
				dashed: frag.dashed ?? false
			};
		}

		return {
			id: frag.id,
			label: frag.label,
			condition: frag.condition,
			x: minX - SEQ_FRAGMENT_PAD_X,
			y: minY - SEQ_FRAGMENT_PAD_Y - SEQ_FRAGMENT_TAG_HEIGHT,
			width: maxX - minX + SEQ_FRAGMENT_PAD_X * 2,
			height: maxY - minY + SEQ_FRAGMENT_PAD_Y * 2 + SEQ_FRAGMENT_TAG_HEIGHT,
			color: (frag.color || 'neutral') as PositionedFragment['color'],
			dashed: frag.dashed ?? false
		};
	});

	// Annotations
	const positions = new Map<string, { x: number; y: number }>();
	const nodeDims = new Map<string, { w: number; h: number }>();
	for (const actor of actors) {
		const x = actorXMap.get(actor.id)!;
		positions.set(actor.id, { x: x - 60, y: SEQ_TOP_MARGIN });
		nodeDims.set(actor.id, { w: 120, h: SEQ_ACTOR_BOX_HEIGHT });
	}
	const annotations = resolveAnnotations(config, positions, nodeDims);

	return {
		nodes: [],
		edges: [],
		clusters: [],
		swimlanes: [],
		regions: [],
		annotations,
		messages: positionedMessages,
		lifelines,
		positionedFragments,
		waypoints: [],
		viewBox: { width: totalWidth, height: totalHeight }
	};
}

// ── Public API ─────────────────────────────────────────────

export function computeLayout(config: DiagramConfig): LayoutResult {
	if (config.layout === 'sequence') return layoutSequence(config);
	if (config.layout === 'swimlane') {
		return layoutSwimlane(config);
	}
	return layoutLayered(config);
}
