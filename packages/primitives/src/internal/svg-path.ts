/**
 * SVG path building utilities — no Svelte, plain TypeScript.
 * Used by Sparkline and Chart Area components.
 */

export interface Point {
	x: number;
	y: number;
}

/**
 * Map data values to SVG coordinates.
 * Values are normalized between min/max and evenly spaced across width.
 * Y is inverted since SVG y-axis goes downward.
 *
 * @param data - Array of numeric values
 * @param width - SVG viewBox width
 * @param height - SVG viewBox height
 * @param padding - Padding from edges in SVG units (default 0)
 * @returns Array of {x, y} coordinates
 */
export function dataToPoints(
	data: number[],
	width: number,
	height: number,
	padding: number = 0
): Point[] {
	if (data.length === 0) return [];

	const min = Math.min(...data);
	const max = Math.max(...data);
	const range = max - min || 1; // avoid division by zero when all values are equal

	const usableWidth = width - padding * 2;
	const usableHeight = height - padding * 2;

	const step = data.length > 1 ? usableWidth / (data.length - 1) : 0;

	return data.map((value, i) => ({
		x: padding + i * step,
		// Invert y: higher values go up (lower y in SVG)
		y: padding + usableHeight - ((value - min) / range) * usableHeight
	}));
}

/**
 * Build an SVG polyline/area path from numeric data points.
 *
 * @param points - Array of numeric values
 * @param width - SVG viewBox width
 * @param height - SVG viewBox height
 * @param options - Configuration options
 * @param options.fill - If true, close the path to the baseline for area fills
 * @param options.smooth - If true, use cubic bezier curves for smooth lines
 * @returns SVG path `d` attribute string
 */
export function buildLinePath(
	points: number[],
	width: number,
	height: number,
	options?: { fill?: boolean; smooth?: boolean }
): string {
	const { fill = false, smooth = false } = options ?? {};
	const coords = dataToPoints(points, width, height);

	if (coords.length === 0) return '';
	if (coords.length === 1) {
		const p = coords[0]!;
		// Single point — draw a tiny line so it's visible
		return `M${p.x},${p.y}L${p.x},${p.y}`;
	}

	let d: string;

	if (smooth) {
		d = buildSmoothPath(coords);
	} else {
		d = buildLinearPath(coords);
	}

	if (fill) {
		// Close path down to the baseline and back to start
		const first = coords[0]!;
		const last = coords[coords.length - 1]!;
		d += `L${last.x},${height}L${first.x},${height}Z`;
	}

	return d;
}

/**
 * Build a straight-line path through all points.
 */
function buildLinearPath(coords: Point[]): string {
	const [first, ...rest] = coords as [Point, ...Point[]];
	let d = `M${first.x},${first.y}`;
	for (const p of rest) {
		d += `L${p.x},${p.y}`;
	}
	return d;
}

/**
 * Build a smooth path using cubic bezier curves.
 * Uses the Catmull-Rom to cubic bezier conversion for natural-looking curves.
 */
function buildSmoothPath(coords: Point[]): string {
	if (coords.length < 2) return '';

	const [first] = coords as [Point, ...Point[]];
	let d = `M${first.x},${first.y}`;

	if (coords.length === 2) {
		// Only two points — just draw a line
		d += `L${coords[1]!.x},${coords[1]!.y}`;
		return d;
	}

	for (let i = 0; i < coords.length - 1; i++) {
		const p0 = coords[Math.max(0, i - 1)]!;
		const p1 = coords[i]!;
		const p2 = coords[i + 1]!;
		const p3 = coords[Math.min(coords.length - 1, i + 2)]!;

		// Control points using Catmull-Rom spline (tension = 0 gives smooth curves)
		const cp1x = p1.x + (p2.x - p0.x) / 6;
		const cp1y = p1.y + (p2.y - p0.y) / 6;
		const cp2x = p2.x - (p3.x - p1.x) / 6;
		const cp2y = p2.y - (p3.y - p1.y) / 6;

		d += `C${cp1x},${cp1y},${cp2x},${cp2y},${p2.x},${p2.y}`;
	}

	return d;
}
