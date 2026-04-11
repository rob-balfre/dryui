import type {
	DiagramConfig,
	DiagramDirection,
	PositionedNode,
	PositionedEdge,
	PositionedCluster,
	PositionedSwimlane,
	PositionedRegion,
	PositionedAnnotation,
	LayoutResult
} from './types.js';
import { computeEdgePaths, emptyEdge } from './edge-routing.js';

const DEFAULT_NODE_GAP = 28;
const DEFAULT_LAYER_GAP = 56;
const DEFAULT_CLUSTER_PADDING = 32;
const DEFAULT_NODE_HEIGHT = 44;
const DESC_NODE_HEIGHT = 64;
const MIN_NODE_WIDTH = 140;
const CHAR_WIDTH = 8.5;
const NODE_PADDING_X = 48;
const MARGIN = 40;

// ── Helpers ────────────────────────────────────────────────

function estimateNodeWidth(label: string, description?: string): number {
	const labelWidth = label.length * CHAR_WIDTH + NODE_PADDING_X;
	const descWidth = description ? description.length * 5.5 + NODE_PADDING_X : 0;
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

// ── Within-Layer Ordering (barycenter, 2 sweeps) ───────────

function orderWithinLayers(
	layers: string[][],
	adjacencyOut: Map<string, string[]>,
	adjacencyIn: Map<string, string[]>
): string[][] {
	const posInLayer = new Map<string, number>();

	// Initialize positions
	for (const layer of layers) {
		for (let i = 0; i < layer.length; i++) {
			posInLayer.set(layer[i], i);
		}
	}

	// Down sweep
	for (let i = 1; i < layers.length; i++) {
		const sorted = layers[i].map((nodeId) => {
			const preds = adjacencyIn.get(nodeId) || [];
			const positions = preds
				.map((p) => posInLayer.get(p))
				.filter((p) => p !== undefined) as number[];
			const barycenter =
				positions.length > 0
					? positions.reduce((a, b) => a + b, 0) / positions.length
					: (posInLayer.get(nodeId) ?? 0);
			return { id: nodeId, bary: barycenter };
		});
		sorted.sort((a, b) => a.bary - b.bary);
		layers[i] = sorted.map((s) => s.id);
		for (let j = 0; j < layers[i].length; j++) {
			posInLayer.set(layers[i][j], j);
		}
	}

	// Up sweep
	for (let i = layers.length - 2; i >= 0; i--) {
		const sorted = layers[i].map((nodeId) => {
			const succs = adjacencyOut.get(nodeId) || [];
			const positions = succs
				.map((s) => posInLayer.get(s))
				.filter((p) => p !== undefined) as number[];
			const barycenter =
				positions.length > 0
					? positions.reduce((a, b) => a + b, 0) / positions.length
					: (posInLayer.get(nodeId) ?? 0);
			return { id: nodeId, bary: barycenter };
		});
		sorted.sort((a, b) => a.bary - b.bary);
		layers[i] = sorted.map((s) => s.id);
		for (let j = 0; j < layers[i].length; j++) {
			posInLayer.set(layers[i][j], j);
		}
	}

	return layers;
}

// ── Coordinate Assignment ──────────────────────────────────

function assignCoordinates(
	layers: string[][],
	nodeDims: Map<string, { w: number; h: number }>,
	direction: DiagramDirection,
	nodeGap: number,
	layerGap: number
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

	// Find max cross-axis extent per layer for centering
	const layerCrossExtents: number[] = [];
	for (const layer of layers) {
		let total = 0;
		for (const id of layer) {
			const dims = nodeDims.get(id)!;
			total += horizontal ? dims.h : dims.w;
		}
		total += (layer.length - 1) * nodeGap;
		layerCrossExtents.push(total);
	}
	const maxCrossExtent = Math.max(...layerCrossExtents);

	// Assign positions
	let layerOffset = MARGIN;
	const layerOrder = reversed ? [...layers].reverse() : layers;
	const sizeOrder = reversed ? [...layerSizes].reverse() : layerSizes;

	for (let li = 0; li < layerOrder.length; li++) {
		const layer = layerOrder[li];
		const layerSize = sizeOrder[li];

		// Center this layer's nodes
		const crossExtent = layerCrossExtents[reversed ? layerOrder.length - 1 - li : li];
		let crossOffset = MARGIN + (maxCrossExtent - crossExtent) / 2;

		for (const id of layer) {
			const dims = nodeDims.get(id)!;
			const primaryOffset = reversed ? (horizontal ? layerSize - dims.w : layerSize - dims.h) : 0;
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
			color: cluster.color || 'neutral',
			dashed: cluster.dashed ?? true
		};
	});
}

// ── Annotations ────────────────────────────────────────────

function resolveAnnotations(
	config: DiagramConfig,
	positions: Map<string, { x: number; y: number }>,
	nodeDims: Map<string, { w: number; h: number }>
): PositionedAnnotation[] {
	if (!config.annotations) return [];

	return config.annotations.map((ann) => {
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
}

// ── Layered Layout (main entry) ────────────────────────────

function layoutLayered(config: DiagramConfig): LayoutResult {
	const direction = config.direction || 'TB';
	const nodeGap = config.spacing?.nodeGap ?? DEFAULT_NODE_GAP;
	const layerGap = config.spacing?.layerGap ?? DEFAULT_LAYER_GAP;
	const clusterPadding = config.spacing?.clusterPadding ?? DEFAULT_CLUSTER_PADDING;

	const nodeIds = config.nodes.map((n) => n.id);
	const nodeDims = buildNodeDims(config.nodes);

	// Build graph and sort
	const graph = buildGraph(nodeIds, config.edges);

	// Assign layers
	const layerMap = assignLayers(graph.order, graph.adjacencyOut);

	// Group by layer
	const maxLayer = Math.max(0, ...layerMap.values());
	const layers: string[][] = Array.from({ length: maxLayer + 1 }, () => []);
	for (const id of graph.order) {
		layers[layerMap.get(id)!].push(id);
	}

	// Order within layers
	const orderedLayers = orderWithinLayers(layers, graph.adjacencyOut, graph.adjacencyIn);

	// Assign coordinates
	const positions = assignCoordinates(orderedLayers, nodeDims, direction, nodeGap, layerGap);

	// Build positioned nodes
	const positionedNodes = buildPositionedNodes(config.nodes, positions, nodeDims);

	// Compute clusters
	const clusters = computeClusterBounds(config, positions, nodeDims, clusterPadding);

	// Compute edges
	const positionedEdges = computeEdgePaths(config.edges, positions, nodeDims, direction);

	// Compute annotations
	const annotations = resolveAnnotations(config, positions, nodeDims);

	// Compute viewBox
	let maxX = 0,
		maxY = 0;
	for (const n of positionedNodes) {
		maxX = Math.max(maxX, n.x + n.width);
		maxY = Math.max(maxY, n.y + n.height);
	}
	for (const c of clusters) {
		maxX = Math.max(maxX, c.x + c.width);
		maxY = Math.max(maxY, c.y + c.height);
	}

	return {
		nodes: positionedNodes,
		edges: positionedEdges,
		clusters,
		swimlanes: [],
		regions: [],
		annotations,
		viewBox: { width: maxX + MARGIN, height: maxY + MARGIN }
	};
}

// ── Swimlane Layout ────────────────────────────────────────

function layoutSwimlane(config: DiagramConfig): LayoutResult {
	const nodeGap = config.spacing?.nodeGap ?? 32;
	const lanes = config.swimlanes || [];
	const nodeDims = buildNodeDims(config.nodes);

	// Assign lanes
	const laneWidth = 180;
	const headerHeight = 50;
	const laneMap = new Map<string, number>();
	for (let i = 0; i < lanes.length; i++) {
		for (const nid of lanes[i].nodes) {
			laneMap.set(nid, i);
		}
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
		const x = MARGIN + laneIdx * laneWidth + (laneWidth - dims.w) / 2;
		positions.set(id, { x, y: currentY });
		currentY += dims.h + nodeGap;
	}

	const totalHeight = currentY + MARGIN;
	const totalWidth = MARGIN * 2 + lanes.length * laneWidth;

	const positionedNodes = buildPositionedNodes(config.nodes, positions, nodeDims);

	// Build swimlane positioned data
	const positionedSwimlanes: PositionedSwimlane[] = lanes.map((lane, i) => ({
		id: lane.id,
		label: lane.label,
		x: MARGIN + i * laneWidth,
		lineX: MARGIN + i * laneWidth + laneWidth / 2,
		headerY: MARGIN,
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
		laneWidth
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
		return {
			id: region.id,
			x: MARGIN + minLane * laneWidth - pad,
			y: minY - pad - 20,
			width: (maxLane - minLane + 1) * laneWidth + pad * 2,
			height: maxY - minY + pad * 2 + 20,
			label: region.label,
			color: region.color || 'neutral',
			dashed: region.dashed ?? true
		};
	});

	// Annotations
	const annotations = resolveAnnotations(config, positions, nodeDims);

	return {
		nodes: positionedNodes,
		edges: positionedEdges,
		clusters: [],
		swimlanes: positionedSwimlanes,
		regions: positionedRegions,
		annotations,
		viewBox: { width: totalWidth, height: totalHeight }
	};
}

// ── Shared Helpers ─────────────────────────────────────────

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

export function computeLayout(config: DiagramConfig): LayoutResult {
	if (config.layout === 'swimlane') {
		return layoutSwimlane(config);
	}
	return layoutLayered(config);
}
