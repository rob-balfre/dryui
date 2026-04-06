import type { Point2D } from './contour.js';

export interface ConvexityDefect {
	start: Point2D;
	end: Point2D;
	farthest: Point2D;
	depth: number;
}

function cross(o: Point2D, a: Point2D, b: Point2D): number {
	return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function distanceToSegment(point: Point2D, start: Point2D, end: Point2D): number {
	const dx = end.x - start.x;
	const dy = end.y - start.y;
	if (dx === 0 && dy === 0) {
		return Math.hypot(point.x - start.x, point.y - start.y);
	}

	const t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy);
	const clamped = Math.max(0, Math.min(1, t));
	const projected = {
		x: start.x + clamped * dx,
		y: start.y + clamped * dy
	};

	return Math.hypot(point.x - projected.x, point.y - projected.y);
}

export function convexHull(points: Point2D[]): Point2D[] {
	if (points.length <= 1) {
		return [...points];
	}

	const sorted = [...points].sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
	const lower: Point2D[] = [];

	for (const point of sorted) {
		while (
			lower.length >= 2 &&
			cross(lower[lower.length - 2]!, lower[lower.length - 1]!, point) <= 0
		) {
			lower.pop();
		}
		lower.push(point);
	}

	const upper: Point2D[] = [];
	for (let index = sorted.length - 1; index >= 0; index -= 1) {
		const point = sorted[index]!;
		while (
			upper.length >= 2 &&
			cross(upper[upper.length - 2]!, upper[upper.length - 1]!, point) <= 0
		) {
			upper.pop();
		}
		upper.push(point);
	}

	lower.pop();
	upper.pop();

	return lower.concat(upper);
}

export function convexityDefects(contour: Point2D[], hull: Point2D[]): ConvexityDefect[] {
	if (contour.length < 3 || hull.length < 3) {
		return [];
	}

	const defects: ConvexityDefect[] = [];

	for (let index = 0; index < hull.length; index += 1) {
		const start = hull[index]!;
		const end = hull[(index + 1) % hull.length]!;
		let farthest = start;
		let depth = 0;

		for (const point of contour) {
			const distance = distanceToSegment(point, start, end);
			if (distance > depth) {
				depth = distance;
				farthest = point;
			}
		}

		if (depth > 0.5) {
			defects.push({ start, end, farthest, depth });
		}
	}

	return defects;
}

export { distanceToSegment };
