<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import { dataToPoints } from '../internal/svg-path.js';

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
		...rest
	}: Props = $props();

	function buildLinePath(points: { x: number; y: number }[]): string {
		if (points.length === 0) return '';
		return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join('');
	}

	function buildAreaPath(points: { x: number; y: number }[], h: number): string {
		if (points.length === 0) return '';
		const line = buildLinePath(points);
		return `${line}L${points[points.length - 1]!.x},${h}L${points[0]!.x},${h}Z`;
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
