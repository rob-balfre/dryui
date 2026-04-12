import type { DiagramEdge, DiagramDirection, PositionedEdge } from './types.js';

const EDGE_GAP = 14;
const BUS_OFFSET_MIN = 28;
const BUS_OFFSET_MAX = 48;

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

export function computeEdgePaths(
	edges: DiagramEdge[],
	positions: Map<string, { x: number; y: number }>,
	nodeDims: Map<string, { w: number; h: number }>,
	direction: DiagramDirection
): PositionedEdge[] {
	const horizontal = direction === 'LR' || direction === 'RL';
	const bySource = new Map<string, DiagramEdge[]>();
	const byTarget = new Map<string, DiagramEdge[]>();

	for (const edge of edges) {
		const sourceList = bySource.get(edge.from) || [];
		sourceList.push(edge);
		bySource.set(edge.from, sourceList);

		const targetList = byTarget.get(edge.to) || [];
		targetList.push(edge);
		byTarget.set(edge.to, targetList);
	}

	const sourceBusCache = new Map<string, number>();
	const targetBusCache = new Map<string, number>();

	return edges.map((edge) => {
		const endpoints = getEndpoints(edge, positions, nodeDims, horizontal);

		if (!endpoints) {
			return emptyEdge(edge);
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
		const path = buildPathFromCollapsed(collapsed);
		const midpoint = getMidpointFromCollapsed(collapsed);

		return {
			from: edge.from,
			to: edge.to,
			path,
			label: edge.label,
			labelX: midpoint.x,
			labelY: midpoint.y - (horizontal ? 12 : 0),
			arrow: edge.arrow || 'end',
			dashed: edge.dashed || false,
			color: edge.color || 'neutral'
		};
	});
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

function buildPathFromCollapsed(collapsed: Point[]): string {
	if (collapsed.length === 0) return '';
	if (collapsed.length === 1) {
		const p = collapsed[0]!;
		return `M ${p.x} ${p.y}`;
	}

	return collapsed
		.map((point, index) => (index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`))
		.join(' ');
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

function getMidpointFromCollapsed(collapsed: Point[]): Point {
	let totalLength = 0;
	const segments: Array<{ from: Point; to: Point; length: number }> = [];

	for (let index = 1; index < collapsed.length; index += 1) {
		const from = collapsed[index - 1]!;
		const to = collapsed[index]!;
		const length = Math.abs(to.x - from.x) + Math.abs(to.y - from.y);

		if (length === 0) continue;

		segments.push({ from, to, length });
		totalLength += length;
	}

	if (totalLength === 0) {
		return collapsed[0] ?? { x: 0, y: 0 };
	}

	let remaining = totalLength / 2;

	for (const segment of segments) {
		if (remaining <= segment.length) {
			if (segment.from.x !== segment.to.x) {
				const direction = Math.sign(segment.to.x - segment.from.x);
				return {
					x: segment.from.x + direction * remaining,
					y: segment.from.y
				};
			}

			const direction = Math.sign(segment.to.y - segment.from.y);
			return {
				x: segment.from.x,
				y: segment.from.y + direction * remaining
			};
		}

		remaining -= segment.length;
	}

	return collapsed[collapsed.length - 1] ?? { x: 0, y: 0 };
}

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
