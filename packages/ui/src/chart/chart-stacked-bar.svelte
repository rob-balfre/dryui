<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import { getChartCtx, type ChartStackedDataPoint } from './context.svelte.js';

	interface Props extends SVGAttributes<SVGGElement> {
		stackedData: ChartStackedDataPoint[];
		radius?: number;
	}

	let { stackedData, radius = 2, class: className, ...rest }: Props = $props();

	const ctx = getChartCtx();
	ctx.hasBars = true;

	const chartWidth = $derived(ctx.width - ctx.padding.left - ctx.padding.right);
	const chartHeight = $derived(ctx.height - ctx.padding.top - ctx.padding.bottom);

	const maxStackValue = $derived(
		Math.max(...stackedData.map((d) => d.segments.reduce((sum, s) => sum + s.value, 0)), 1)
	);

	const barGroups = $derived(
		stackedData.map((point, i) => {
			const barWidth = (chartWidth / stackedData.length) * 0.7;
			const gap = (chartWidth / stackedData.length) * 0.3;
			const x = ctx.padding.left + i * (barWidth + gap) + gap / 2;

			let cumHeight = 0;
			const rects = point.segments.map((seg) => {
				const segHeight = (seg.value / maxStackValue) * chartHeight;
				cumHeight += segHeight;
				const y = ctx.padding.top + chartHeight - cumHeight;
				return {
					x,
					y,
					width: barWidth,
					height: Math.max(0, segHeight),
					color: seg.color,
					value: seg.value
				};
			});

			return { label: point.label, rects };
		})
	);
</script>

<g
	role="list"
	aria-label="Stacked bar chart data"
	data-chart-stacked-bar
	class={className}
	{...rest}
>
	{#each barGroups as group}
		<g role="listitem" aria-label={group.label}>
			{#each group.rects as rect}
				<rect
					x={rect.x}
					y={rect.y}
					width={rect.width}
					height={rect.height}
					rx={radius}
					fill={rect.color}
					data-part="stacked-segment"
				/>
			{/each}
		</g>
	{/each}
</g>

<style>
	[data-chart-stacked-bar] {
		color: var(--dry-chart-bar-color);
	}
</style>
