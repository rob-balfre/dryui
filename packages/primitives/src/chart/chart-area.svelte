<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import { getChartCtx } from './context.svelte.js';

	interface Props extends SVGAttributes<SVGGElement> {
		strokeWidth?: number;
		showDots?: boolean;
		dotRadius?: number;
		color?: string;
	}

	let {
		strokeWidth = 2,
		showDots = false,
		dotRadius = 3,
		color = 'currentColor',
		...rest
	}: Props = $props();

	const ctx = getChartCtx();

	const chartWidth = $derived(ctx.width - ctx.padding.left - ctx.padding.right);
	const chartHeight = $derived(ctx.height - ctx.padding.top - ctx.padding.bottom);
	const valueRange = $derived(ctx.maxValue - ctx.minValue || 1);

	const points = $derived(
		ctx.data.map((point, i) => {
			const x = ctx.padding.left + (i / Math.max(ctx.data.length - 1, 1)) * chartWidth;
			const y =
				ctx.padding.top + chartHeight - ((point.value - ctx.minValue) / valueRange) * chartHeight;
			return { x, y, point };
		})
	);

	const lineD = $derived(points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' '));

	const baseline = $derived(ctx.padding.top + chartHeight);

	const areaD = $derived(
		lineD +
			` L ${points[points.length - 1]?.x ?? 0} ${baseline}` +
			` L ${points[0]?.x ?? 0} ${baseline} Z`
	);
</script>

<g role="list" aria-label="Area chart data" {...rest}>
	<path d={areaD} fill={color} stroke="none" data-part="area-fill" />
	<path
		d={lineD}
		fill="none"
		stroke={color}
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
		data-part="area-line"
	/>
	{#if showDots}
		{#each points as p}
			<circle
				cx={p.x}
				cy={p.y}
				r={dotRadius}
				fill={p.point.color ?? color}
				role="listitem"
				aria-label="{p.point.label}: {p.point.value}"
			/>
		{/each}
	{/if}
</g>
