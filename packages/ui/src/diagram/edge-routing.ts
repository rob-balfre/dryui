import type { DiagramEdge, DiagramDirection, DiagramLoopSide, PositionedEdge } from './types.js';

const EDGE_GAP = 14;
const BUS_OFFSET_MIN = 28;
const BUS_OFFSET_MAX = 48;
const DEFAULT_CORNER_RADIUS = 6;
const BACK_EDGE_LANE_GAP = 32;
const BACK_EDGE_LANE_STEP = 22;

interface Point {
	x: number;
	y: number;
}

interface Endpoints {
	fx: number;
	fy: number;
	tx: number;
	ty: number;
}

export interface EdgeRouteBounds {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
}

function edgeKey(edge: { from: string; to: string }): string {
	return `${edge.from}->${edge.to}`;
}

export interface ComputedEdges {
	edges: PositionedEdge[];
	collapsed: (Point[] | null)[];
}

export function computeEdgePaths(
	edges: DiagramEdge[],
	positions: Map<string, { x: number; y: number }>,
	nodeDims: Map<string, { w: number; h: number }>,
	direction: DiagramDirection,
	cornerRadius: number = DEFAULT_CORNER_RADIUS,
	reversedEdges: Set<string> = new Set(),
	bounds?: EdgeRouteBounds
): ComputedEdges {
	const horizontal = direction === 'LR' || direction === 'RL';
	const bySource = new Map<string, DiagramEdge[]>();
	const byTarget = new Map<string, DiagramEdge[]>();

	for (const edge of edges) {
		if (reversedEdges.has(edgeKey(edge))) continue;
		const sourceList = bySource.get(edge.from) || [];
		sourceList.push(edge);
		bySource.set(edge.from, sourceList);

		const targetList = byTarget.get(edge.to) || [];
		targetList.push(edge);
		byTarget.set(edge.to, targetList);
	}

	const sourceBusCache = new Map<string, number>();
	const targetBusCache = new Map<string, number>();

	const laneCounters: Record<DiagramLoopSide, number> = {
		over: 0,
		under: 0,
		left: 0,
		right: 0
	};

	const out: PositionedEdge[] = [];
	const collapsedOut: (Point[] | null)[] = [];

	edges.forEach((edge) => {
		const isBack = reversedEdges.has(edgeKey(edge));

		if (isBack && bounds) {
			const side = pickBackEdgeSide(edge.loop, direction);
			const endpoints = getBackEdgeEndpoints(edge, positions, nodeDims, side);
			if (!endpoints) {
				out.push(emptyEdge(edge));
				collapsedOut.push(null);
				return;
			}
			const laneIndex = laneCounters[side]++;
			const points = buildBackEdgePoints(endpoints, side, bounds, laneIndex);
			const collapsed = collapsePoints(points);
			const path = buildPathFromCollapsed(collapsed, cornerRadius);
			const midpoint = getMidpointFromCollapsed(collapsed);
			const labelOffset = side === 'over' ? -10 : side === 'under' ? 14 : 0;
			out.push({
				from: edge.from,
				to: edge.to,
				path,
				label: edge.label,
				labelX: midpoint.x,
				labelY: midpoint.y + labelOffset,
				arrow: edge.arrow || 'end',
				dashed: edge.dashed || false,
				color: edge.color || 'neutral'
			});
			collapsedOut.push(collapsed);
			return;
		}

		const endpoints = getEndpoints(edge, positions, nodeDims, horizontal);

		if (!endpoints) {
			out.push(emptyEdge(edge));
			collapsedOut.push(null);
			return;
		}

		const sourceSiblings = bySource.get(edge.from) || [];
		const targetSiblings = byTarget.get(edge.to) || [];

		let points: Point[];

		if (horizontal) {
			if (sourceSiblings.length > 1) {
				let busX = sourceBusCache.get(edge.from);
				if (busX === undefined) {
					busX = computeSourceBusAxis(
						sourceSiblings,
						positions,
						nodeDims,
						horizontal,
						endpoints.fx
					);
					sourceBusCache.set(edge.from, busX);
				}
				points = buildHorizontalBusPoints(endpoints, busX);
			} else if (targetSiblings.length > 1) {
				let busX = targetBusCache.get(edge.to);
				if (busX === undefined) {
					busX = computeTargetBusAxis(
						targetSiblings,
						positions,
						nodeDims,
						horizontal,
						endpoints.tx
					);
					targetBusCache.set(edge.to, busX);
				}
				points = buildHorizontalBusPoints(endpoints, busX);
			} else {
				points = buildHorizontalPoints(endpoints);
			}
		} else if (sourceSiblings.length > 1) {
			let busY = sourceBusCache.get(edge.from);
			if (busY === undefined) {
				busY = computeSourceBusAxis(sourceSiblings, positions, nodeDims, horizontal, endpoints.fy);
				sourceBusCache.set(edge.from, busY);
			}
			points = buildVerticalBusPoints(endpoints, busY);
		} else if (targetSiblings.length > 1) {
			let busY = targetBusCache.get(edge.to);
			if (busY === undefined) {
				busY = computeTargetBusAxis(targetSiblings, positions, nodeDims, horizontal, endpoints.ty);
				targetBusCache.set(edge.to, busY);
			}
			points = buildVerticalBusPoints(endpoints, busY);
		} else {
			points = buildVerticalPoints(endpoints);
		}

		const collapsed = collapsePoints(points);
		const path = buildPathFromCollapsed(collapsed, cornerRadius);
		const midpoint = getMidpointFromCollapsed(collapsed);

		out.push({
			from: edge.from,
			to: edge.to,
			path,
			label: edge.label,
			labelX: midpoint.x,
			labelY: midpoint.y - (horizontal ? 12 : 0),
			arrow: edge.arrow || 'end',
			dashed: edge.dashed || false,
			color: edge.color || 'neutral'
		});
		collapsedOut.push(collapsed);
	});

	return { edges: out, collapsed: collapsedOut };
}

function pickBackEdgeSide(
	override: DiagramLoopSide | undefined,
	direction: DiagramDirection
): DiagramLoopSide {
	if (override) return override;
	return direction === 'LR' || direction === 'RL' ? 'over' : 'right';
}

function getBackEdgeEndpoints(
	edge: DiagramEdge,
	positions: Map<string, { x: number; y: number }>,
	nodeDims: Map<string, { w: number; h: number }>,
	side: DiagramLoopSide
): Endpoints | undefined {
	const fromPos = positions.get(edge.from);
	const toPos = positions.get(edge.to);
	const fromDims = nodeDims.get(edge.from);
	const toDims = nodeDims.get(edge.to);
	if (!fromPos || !toPos || !fromDims || !toDims) return undefined;

	const fromCenter = {
		x: fromPos.x + fromDims.w / 2,
		y: fromPos.y + fromDims.h / 2
	};
	const toCenter = {
		x: toPos.x + toDims.w / 2,
		y: toPos.y + toDims.h / 2
	};

	switch (side) {
		case 'over':
			return {
				fx: fromCenter.x,
				fy: fromPos.y - EDGE_GAP,
				tx: toCenter.x,
				ty: toPos.y - EDGE_GAP
			};
		case 'under':
			return {
				fx: fromCenter.x,
				fy: fromPos.y + fromDims.h + EDGE_GAP,
				tx: toCenter.x,
				ty: toPos.y + toDims.h + EDGE_GAP
			};
		case 'right':
			return {
				fx: fromPos.x + fromDims.w + EDGE_GAP,
				fy: fromCenter.y,
				tx: toPos.x + toDims.w + EDGE_GAP,
				ty: toCenter.y
			};
		case 'left':
			return {
				fx: fromPos.x - EDGE_GAP,
				fy: fromCenter.y,
				tx: toPos.x - EDGE_GAP,
				ty: toCenter.y
			};
	}
}

function buildBackEdgePoints(
	endpoints: Endpoints,
	side: DiagramLoopSide,
	bounds: EdgeRouteBounds,
	laneIndex: number
): Point[] {
	switch (side) {
		case 'over': {
			const outerY = bounds.minY - BACK_EDGE_LANE_GAP - laneIndex * BACK_EDGE_LANE_STEP;
			return [
				{ x: endpoints.fx, y: endpoints.fy },
				{ x: endpoints.fx, y: outerY },
				{ x: endpoints.tx, y: outerY },
				{ x: endpoints.tx, y: endpoints.ty }
			];
		}
		case 'under': {
			const outerY = bounds.maxY + BACK_EDGE_LANE_GAP + laneIndex * BACK_EDGE_LANE_STEP;
			return [
				{ x: endpoints.fx, y: endpoints.fy },
				{ x: endpoints.fx, y: outerY },
				{ x: endpoints.tx, y: outerY },
				{ x: endpoints.tx, y: endpoints.ty }
			];
		}
		case 'right': {
			const outerX = bounds.maxX + BACK_EDGE_LANE_GAP + laneIndex * BACK_EDGE_LANE_STEP;
			return [
				{ x: endpoints.fx, y: endpoints.fy },
				{ x: outerX, y: endpoints.fy },
				{ x: outerX, y: endpoints.ty },
				{ x: endpoints.tx, y: endpoints.ty }
			];
		}
		case 'left': {
			const outerX = bounds.minX - BACK_EDGE_LANE_GAP - laneIndex * BACK_EDGE_LANE_STEP;
			return [
				{ x: endpoints.fx, y: endpoints.fy },
				{ x: outerX, y: endpoints.fy },
				{ x: outerX, y: endpoints.ty },
				{ x: endpoints.tx, y: endpoints.ty }
			];
		}
	}
}

function getEndpoints(
	edge: DiagramEdge,
	positions: Map<string, { x: number; y: number }>,
	nodeDims: Map<string, { w: number; h: number }>,
	horizontal: boolean
): Endpoints | undefined {
	const fromPos = positions.get(edge.from);
	const toPos = positions.get(edge.to);
	const fromDims = nodeDims.get(edge.from);
	const toDims = nodeDims.get(edge.to);

	if (!fromPos || !toPos || !fromDims || !toDims) {
		return undefined;
	}

	const fromCenter = {
		x: fromPos.x + fromDims.w / 2,
		y: fromPos.y + fromDims.h / 2
	};
	const toCenter = {
		x: toPos.x + toDims.w / 2,
		y: toPos.y + toDims.h / 2
	};

	if (horizontal) {
		const leftToRight = fromCenter.x <= toCenter.x;
		return {
			fx: leftToRight ? fromPos.x + fromDims.w + EDGE_GAP : fromPos.x - EDGE_GAP,
			fy: fromCenter.y,
			tx: leftToRight ? toPos.x - EDGE_GAP : toPos.x + toDims.w + EDGE_GAP,
			ty: toCenter.y
		};
	}

	const topToBottom = fromCenter.y <= toCenter.y;
	return {
		fx: fromCenter.x,
		fy: topToBottom ? fromPos.y + fromDims.h + EDGE_GAP : fromPos.y - EDGE_GAP,
		tx: toCenter.x,
		ty: topToBottom ? toPos.y - EDGE_GAP : toPos.y + toDims.h + EDGE_GAP
	};
}

function computeSourceBusAxis(
	siblings: DiagramEdge[],
	positions: Map<string, { x: number; y: number }>,
	nodeDims: Map<string, { w: number; h: number }>,
	horizontal: boolean,
	sourceAxis: number
): number {
	const targetAxes = siblings
		.map((edge) => getEndpoints(edge, positions, nodeDims, horizontal))
		.filter((endpoints): endpoints is Endpoints => Boolean(endpoints))
		.map((endpoints) => (horizontal ? endpoints.tx : endpoints.ty));

	if (targetAxes.length === 0) {
		return sourceAxis;
	}

	const direction =
		Math.sign(targetAxes.reduce((sum, axis) => sum + axis, 0) / targetAxes.length - sourceAxis) ||
		1;
	const nearestAxis = direction > 0 ? Math.min(...targetAxes) : Math.max(...targetAxes);
	const available = Math.abs(nearestAxis - sourceAxis);
	const offset = clampBusOffset(available);

	return sourceAxis + direction * offset;
}

function computeTargetBusAxis(
	siblings: DiagramEdge[],
	positions: Map<string, { x: number; y: number }>,
	nodeDims: Map<string, { w: number; h: number }>,
	horizontal: boolean,
	targetAxis: number
): number {
	const sourceAxes = siblings
		.map((edge) => getEndpoints(edge, positions, nodeDims, horizontal))
		.filter((endpoints): endpoints is Endpoints => Boolean(endpoints))
		.map((endpoints) => (horizontal ? endpoints.fx : endpoints.fy));

	if (sourceAxes.length === 0) {
		return targetAxis;
	}

	const direction =
		Math.sign(targetAxis - sourceAxes.reduce((sum, axis) => sum + axis, 0) / sourceAxes.length) ||
		1;
	const nearestAxis = direction > 0 ? Math.max(...sourceAxes) : Math.min(...sourceAxes);
	const available = Math.abs(targetAxis - nearestAxis);
	const offset = clampBusOffset(available);

	return targetAxis - direction * offset;
}

function clampBusOffset(available: number): number {
	if (available <= 0) return 0;
	return Math.min(BUS_OFFSET_MAX, Math.max(BUS_OFFSET_MIN, available * 0.28), available / 2);
}

function buildHorizontalPoints(endpoints: Endpoints): Point[] {
	if (Math.abs(endpoints.ty - endpoints.fy) < 1) {
		return [
			{ x: endpoints.fx, y: endpoints.fy },
			{ x: endpoints.tx, y: endpoints.ty }
		];
	}

	const midX = endpoints.fx + (endpoints.tx - endpoints.fx) / 2;

	return [
		{ x: endpoints.fx, y: endpoints.fy },
		{ x: midX, y: endpoints.fy },
		{ x: midX, y: endpoints.ty },
		{ x: endpoints.tx, y: endpoints.ty }
	];
}

function buildVerticalPoints(endpoints: Endpoints): Point[] {
	if (Math.abs(endpoints.tx - endpoints.fx) < 1) {
		return [
			{ x: endpoints.fx, y: endpoints.fy },
			{ x: endpoints.tx, y: endpoints.ty }
		];
	}

	const midY = endpoints.fy + (endpoints.ty - endpoints.fy) / 2;

	return [
		{ x: endpoints.fx, y: endpoints.fy },
		{ x: endpoints.fx, y: midY },
		{ x: endpoints.tx, y: midY },
		{ x: endpoints.tx, y: endpoints.ty }
	];
}

function buildHorizontalBusPoints(endpoints: Endpoints, busX: number): Point[] {
	const points: Point[] = [{ x: endpoints.fx, y: endpoints.fy }];

	if (Math.abs(busX - endpoints.fx) >= 1) {
		points.push({ x: busX, y: endpoints.fy });
	}

	if (Math.abs(endpoints.ty - endpoints.fy) >= 1) {
		points.push({ x: busX, y: endpoints.ty });
	}

	points.push({ x: endpoints.tx, y: endpoints.ty });
	return points;
}

function buildVerticalBusPoints(endpoints: Endpoints, busY: number): Point[] {
	const points: Point[] = [{ x: endpoints.fx, y: endpoints.fy }];

	if (Math.abs(busY - endpoints.fy) >= 1) {
		points.push({ x: endpoints.fx, y: busY });
	}

	if (Math.abs(endpoints.tx - endpoints.fx) >= 1) {
		points.push({ x: endpoints.tx, y: busY });
	}

	points.push({ x: endpoints.tx, y: endpoints.ty });
	return points;
}

function buildPathFromCollapsed(collapsed: Point[], cornerRadius: number = 0): string {
	if (collapsed.length === 0) return '';
	if (collapsed.length === 1) {
		const p = collapsed[0]!;
		return `M ${p.x} ${p.y}`;
	}

	if (cornerRadius <= 0 || collapsed.length < 3) {
		return collapsed
			.map((point, index) => (index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`))
			.join(' ');
	}

	const first = collapsed[0]!;
	const segments: string[] = [`M ${first.x} ${first.y}`];

	for (let i = 1; i < collapsed.length - 1; i++) {
		const prev = collapsed[i - 1]!;
		const corner = collapsed[i]!;
		const next = collapsed[i + 1]!;

		const inDX = corner.x - prev.x;
		const inDY = corner.y - prev.y;
		const inLen = Math.hypot(inDX, inDY);
		const outDX = next.x - corner.x;
		const outDY = next.y - corner.y;
		const outLen = Math.hypot(outDX, outDY);

		if (inLen < 0.01 || outLen < 0.01) {
			segments.push(`L ${corner.x} ${corner.y}`);
			continue;
		}

		const r = Math.min(cornerRadius, inLen / 2, outLen / 2);
		const startX = corner.x - (inDX / inLen) * r;
		const startY = corner.y - (inDY / inLen) * r;
		const endX = corner.x + (outDX / outLen) * r;
		const endY = corner.y + (outDY / outLen) * r;

		segments.push(`L ${startX} ${startY}`);
		segments.push(`Q ${corner.x} ${corner.y} ${endX} ${endY}`);
	}

	const last = collapsed[collapsed.length - 1]!;
	segments.push(`L ${last.x} ${last.y}`);

	return segments.join(' ');
}

function collapsePoints(points: Point[]): Point[] {
	const collapsed: Point[] = [];

	for (const point of points) {
		const snapped = snapPoint(point);
		const previous = collapsed[collapsed.length - 1];
		if (
			previous &&
			Math.abs(previous.x - snapped.x) < 0.01 &&
			Math.abs(previous.y - snapped.y) < 0.01
		) {
			continue;
		}
		collapsed.push(snapped);
	}

	return collapsed;
}

function snapPoint(point: Point): Point {
	return {
		x: snapCoordinate(point.x),
		y: snapCoordinate(point.y)
	};
}

function snapCoordinate(value: number): number {
	return Math.round(value) + 0.5;
}

export interface PointAtFraction {
	point: Point;
	segmentIndex: number;
	axis: 'h' | 'v';
}

export function getPointAtFraction(collapsed: Point[], t: number): PointAtFraction {
	const fallback: PointAtFraction = {
		point: collapsed[0] ?? { x: 0, y: 0 },
		segmentIndex: 0,
		axis: 'h'
	};
	if (collapsed.length < 2) return fallback;

	let totalLength = 0;
	const segments: Array<{
		from: Point;
		to: Point;
		length: number;
		index: number;
		axis: 'h' | 'v';
	}> = [];

	for (let index = 1; index < collapsed.length; index += 1) {
		const from = collapsed[index - 1]!;
		const to = collapsed[index]!;
		const length = Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
		if (length === 0) continue;
		const axis: 'h' | 'v' = from.x !== to.x ? 'h' : 'v';
		segments.push({ from, to, length, index, axis });
		totalLength += length;
	}

	if (totalLength === 0) return fallback;

	const clamped = Math.max(0, Math.min(1, t));
	let remaining = totalLength * clamped;

	for (const segment of segments) {
		if (remaining <= segment.length) {
			if (segment.axis === 'h') {
				const direction = Math.sign(segment.to.x - segment.from.x);
				return {
					point: { x: segment.from.x + direction * remaining, y: segment.from.y },
					segmentIndex: segment.index,
					axis: 'h'
				};
			}
			const direction = Math.sign(segment.to.y - segment.from.y);
			return {
				point: { x: segment.from.x, y: segment.from.y + direction * remaining },
				segmentIndex: segment.index,
				axis: 'v'
			};
		}
		remaining -= segment.length;
	}

	const lastIndex = collapsed.length - 1;
	const last = collapsed[lastIndex] ?? { x: 0, y: 0 };
	return { point: last, segmentIndex: lastIndex, axis: 'h' };
}

function getMidpointFromCollapsed(collapsed: Point[]): Point {
	return getPointAtFraction(collapsed, 0.5).point;
}

export interface WaypointBox {
	x: number;
	y: number;
	width: number;
	height: number;
}

/** Split a collapsed polyline at the entry/exit intersections with a box centered on a point.
 * The box is placed perpendicular to the segment containing the split point, so the polyline
 * enters one side of the box and exits the opposite side. Returns null if the split is degenerate.
 */
export function splitCollapsedAtBox(
	collapsed: Point[],
	segmentIndex: number,
	box: WaypointBox,
	axis: 'h' | 'v'
): { entry: Point[]; exit: Point[] } | null {
	if (collapsed.length < 2 || segmentIndex < 1 || segmentIndex >= collapsed.length) return null;

	const segFrom = collapsed[segmentIndex - 1]!;
	const segTo = collapsed[segmentIndex]!;

	let entryPoint: Point;
	let exitPoint: Point;

	if (axis === 'h') {
		// Horizontal segment — polyline enters left side of box, exits right
		const goingRight = segTo.x > segFrom.x;
		const leftEdge = box.x;
		const rightEdge = box.x + box.width;
		entryPoint = { x: goingRight ? leftEdge : rightEdge, y: segFrom.y };
		exitPoint = { x: goingRight ? rightEdge : leftEdge, y: segFrom.y };
	} else {
		// Vertical segment — polyline enters top, exits bottom (or vice versa)
		const goingDown = segTo.y > segFrom.y;
		const topEdge = box.y;
		const bottomEdge = box.y + box.height;
		entryPoint = { x: segFrom.x, y: goingDown ? topEdge : bottomEdge };
		exitPoint = { x: segFrom.x, y: goingDown ? bottomEdge : topEdge };
	}

	const entry: Point[] = collapsed.slice(0, segmentIndex);
	entry.push(snapPoint(entryPoint));

	const exit: Point[] = [snapPoint(exitPoint), ...collapsed.slice(segmentIndex)];

	if (entry.length < 2 || exit.length < 2) return null;
	return { entry, exit };
}

export { collapsePoints, buildPathFromCollapsed };

export function emptyEdge(edge: DiagramEdge): PositionedEdge {
	return {
		from: edge.from,
		to: edge.to,
		path: '',
		label: edge.label,
		labelX: 0,
		labelY: 0,
		arrow: edge.arrow || 'end',
		dashed: edge.dashed || false,
		color: edge.color || 'neutral'
	};
}
