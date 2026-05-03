<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';

	interface Props extends Omit<SVGAttributes<SVGSVGElement>, 'fill'> {
		data: number[];
		width?: number;
		height?: number;
		color?: string;
		filled?: boolean;
		strokeWidth?: number;
		highlightLast?: boolean;
	}

	let {
		data,
		width = 100,
		height = 32,
		color = 'currentColor',
		filled = false,
		strokeWidth = 2,
		highlightLast = false,
		class: className,
		...rest
	}: Props = $props();

	function dataToPoints(values: number[], w: number, h: number, padding: number) {
		if (values.length === 0) return [];
		const min = Math.min(...values);
		const max = Math.max(...values);
		const range = max - min || 1;
		const usableW = w - padding * 2;
		const usableH = h - padding * 2;
		const step = values.length > 1 ? usableW / (values.length - 1) : 0;
		return values.map((v, i) => ({
			x: padding + i * step,
			y: padding + usableH - ((v - min) / range) * usableH
		}));
	}

	function buildLinePath(pts: { x: number; y: number }[]): string {
		if (pts.length === 0) return '';
		return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join('');
	}

	function buildAreaPath(pts: { x: number; y: number }[], h: number): string {
		if (pts.length === 0) return '';
		const line = buildLinePath(pts);
		return `${line}L${pts[pts.length - 1]!.x},${h}L${pts[0]!.x},${h}Z`;
	}

	const points = $derived(dataToPoints(data, width, height, 2));
	const linePath = $derived(buildLinePath(points));
	const areaPath = $derived(filled ? buildAreaPath(points, height) : '');
	const lastPoint = $derived(points.length > 0 ? points[points.length - 1] : null);
</script>

<svg
	viewBox="0 0 {width} {height}"
	{width}
	{height}
	fill="none"
	role="img"
	aria-label="Sparkline chart"
	data-sparkline
	class={className}
	{...rest}
>
	{#if filled && areaPath}
		<path d={areaPath} fill={color} opacity="0.1" data-part="area" />
	{/if}
	{#if linePath}
		<path
			d={linePath}
			stroke={color}
			stroke-width={strokeWidth}
			stroke-linecap="round"
			stroke-linejoin="round"
			data-part="line"
		/>
	{/if}
	{#if highlightLast && lastPoint}
		<circle
			cx={lastPoint.x}
			cy={lastPoint.y}
			r={strokeWidth + 1}
			fill={color}
			data-part="last-point"
		/>
	{/if}
</svg>

<style>
	[data-sparkline] {
		--dry-sparkline-color: var(--dry-color-fill-brand, currentColor);
		--dry-sparkline-fill-opacity: 0.1;

		display: inline-block;
		vertical-align: middle;
		color: var(--dry-sparkline-color);
	}

	[data-sparkline] [data-part='area'] {
		opacity: var(--dry-sparkline-fill-opacity);
	}

	[data-sparkline] [data-part='line'] {
		stroke: var(--dry-sparkline-color);
	}

	[data-sparkline] [data-part='last-point'] {
		fill: var(--dry-sparkline-color);
	}
</style>
