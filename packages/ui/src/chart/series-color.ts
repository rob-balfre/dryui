const SERIES_SLOTS = 8;

/**
 * Resolve a chart series colour for the given index. Wraps modulo
 * `SERIES_SLOTS` and returns a `var(--dry-chart-series-N, currentColor)`
 * string suitable for SVG `fill` / `stroke` attributes. The
 * `--dry-chart-series-1..8` palette is defined on `chart-root`.
 */
export function chartSeriesColor(index: number): string {
	const slot = (index % SERIES_SLOTS) + 1;
	return `var(--dry-chart-series-${slot}, currentColor)`;
}
