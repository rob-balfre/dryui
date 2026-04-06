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
export declare function dataToPoints(
	data: number[],
	width: number,
	height: number,
	padding?: number
): Point[];
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
export declare function buildLinePath(
	points: number[],
	width: number,
	height: number,
	options?: {
		fill?: boolean;
		smooth?: boolean;
	}
): string;
