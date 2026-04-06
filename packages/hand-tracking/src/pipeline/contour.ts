export interface Point2D {
	x: number;
	y: number;
}

export interface Contour {
	points: Point2D[];
	area: number;
	centroid: Point2D;
	bounds: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	pixelCount: number;
}

function key(x: number, y: number): string {
	return `${x}:${y}`;
}

function polygonArea(points: Point2D[]): number {
	if (points.length < 3) {
		return 0;
	}

	let area = 0;
	for (let index = 0; index < points.length; index += 1) {
		const current = points[index]!;
		const next = points[(index + 1) % points.length]!;
		area += current.x * next.y - next.x * current.y;
	}

	return Math.abs(area) / 2;
}

function centroid(points: Point2D[]): Point2D {
	if (points.length === 0) {
		return { x: 0, y: 0 };
	}

	let sumX = 0;
	let sumY = 0;
	for (const point of points) {
		sumX += point.x;
		sumY += point.y;
	}

	return {
		x: sumX / points.length,
		y: sumY / points.length
	};
}

function bounds(points: Point2D[]): Contour['bounds'] {
	if (points.length === 0) {
		return { x: 0, y: 0, width: 0, height: 0 };
	}

	let minX = Number.POSITIVE_INFINITY;
	let minY = Number.POSITIVE_INFINITY;
	let maxX = Number.NEGATIVE_INFINITY;
	let maxY = Number.NEGATIVE_INFINITY;

	for (const point of points) {
		minX = Math.min(minX, point.x);
		minY = Math.min(minY, point.y);
		maxX = Math.max(maxX, point.x);
		maxY = Math.max(maxY, point.y);
	}

	return {
		x: minX,
		y: minY,
		width: maxX - minX + 1,
		height: maxY - minY + 1
	};
}

function simplifyCollinear(points: Point2D[]): Point2D[] {
	if (points.length < 3) {
		return points;
	}

	const simplified: Point2D[] = [];
	for (let index = 0; index < points.length; index += 1) {
		const previous = points[(index - 1 + points.length) % points.length]!;
		const current = points[index]!;
		const next = points[(index + 1) % points.length]!;
		const cross =
			(current.x - previous.x) * (next.y - current.y) -
			(current.y - previous.y) * (next.x - current.x);

		if (Math.abs(cross) > 1e-6) {
			simplified.push(current);
		}
	}

	return simplified.length > 0 ? simplified : points;
}

function dedupe(points: Point2D[]): Point2D[] {
	const seen = new Set<string>();
	const output: Point2D[] = [];

	for (const point of points) {
		const item = key(point.x, point.y);
		if (seen.has(item)) continue;
		seen.add(item);
		output.push(point);
	}

	return output;
}

function sortBoundary(points: Point2D[]): Point2D[] {
	const center = centroid(points);
	return [...points].sort((a, b) => {
		const angleA = Math.atan2(a.y - center.y, a.x - center.x);
		const angleB = Math.atan2(b.y - center.y, b.x - center.x);
		if (angleA !== angleB) {
			return angleA - angleB;
		}

		const distanceA = (a.x - center.x) ** 2 + (a.y - center.y) ** 2;
		const distanceB = (b.x - center.x) ** 2 + (b.y - center.y) ** 2;
		return distanceA - distanceB;
	});
}

function collectComponent(
	mask: Uint8Array,
	width: number,
	height: number,
	startIndex: number,
	visited: Uint8Array
): Point2D[] {
	const queue = [startIndex];
	visited[startIndex] = 1;
	const pixels: Point2D[] = [];

	while (queue.length > 0) {
		const index = queue.pop()!;
		const x = index % width;
		const y = Math.floor(index / width);
		pixels.push({ x, y });

		const neighbors = [
			[x - 1, y],
			[x + 1, y],
			[x, y - 1],
			[x, y + 1],
			[x - 1, y - 1],
			[x + 1, y - 1],
			[x - 1, y + 1],
			[x + 1, y + 1]
		];

		for (const neighbor of neighbors) {
			const nx = neighbor[0];
			const ny = neighbor[1];
			if (nx === undefined || ny === undefined) {
				continue;
			}

			if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
				continue;
			}
			const neighborIndex = ny * width + nx;
			if (visited[neighborIndex] || !mask[neighborIndex]) {
				continue;
			}
			visited[neighborIndex] = 1;
			queue.push(neighborIndex);
		}
	}

	return pixels;
}

export function extractContours(mask: Uint8Array, width: number, height: number): Contour[] {
	const visited = new Uint8Array(mask.length);
	const contours: Contour[] = [];

	for (let index = 0; index < mask.length; index += 1) {
		if (!mask[index] || visited[index]) continue;

		const component = collectComponent(mask, width, height, index, visited);
		const componentKeys = new Set(component.map((point) => key(point.x, point.y)));
		const boundary = component.filter((point) => {
			for (let dy = -1; dy <= 1; dy += 1) {
				for (let dx = -1; dx <= 1; dx += 1) {
					if (dx === 0 && dy === 0) continue;
					const nx = point.x + dx;
					const ny = point.y + dy;
					if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
						return true;
					}
					if (!componentKeys.has(key(nx, ny))) {
						return true;
					}
				}
			}
			return false;
		});

		const ordered = simplifyCollinear(
			dedupe(sortBoundary(boundary.length > 0 ? boundary : component))
		);
		const center = centroid(ordered);
		contours.push({
			points: ordered,
			area: polygonArea(ordered),
			centroid: center,
			bounds: bounds(component),
			pixelCount: component.length
		});
	}

	return contours.sort((a, b) => b.area - a.area);
}

export function findLargestContour(
	mask: Uint8Array,
	width: number,
	height: number
): Contour | null {
	return extractContours(mask, width, height)[0] ?? null;
}

export { polygonArea, simplifyCollinear };
