<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import { getChartCtx } from './context.svelte.js';

	interface Props extends SVGAttributes<SVGGElement> {
		radius?: number;
	}

	let { radius = 2, ...rest }: Props = $props();

	const ctx = getChartCtx();
	ctx.hasHorizontalBars = true;

	const chartWidth = $derived(ctx.width - ctx.padding.left - ctx.padding.right);
	const chartHeight = $derived(ctx.height - ctx.padding.top - ctx.padding.bottom);
	const valueRange = $derived(ctx.maxValue - ctx.minValue || 1);

	const bars = $derived(
		ctx.data.map((point, i) => {
			const barHeight = (chartHeight / ctx.data.length) * 0.7;
			const gap = (chartHeight / ctx.data.length) * 0.3;
			const y = ctx.padding.top + i * (barHeight + gap) + gap / 2;
			const barWidth = ((point.value - ctx.minValue) / valueRange) * chartWidth;
			const x = ctx.padding.left;

			return { x, y, width: Math.max(0, barWidth), height: barHeight, point };
		})
	);
</script>

<g role="list" aria-label="Horizontal bar chart data" {...rest}>
	{#each bars as bar}
		<rect
			x={bar.x}
			y={bar.y}
			width={bar.width}
			height={bar.height}
			rx={radius}
			fill={bar.point.color ?? 'currentColor'}
			role="listitem"
			aria-label="{bar.point.label}: {bar.point.value}"
			data-part="horizontal-bar"
		/>
		<text
			x={bar.x - 8}
			y={bar.y + bar.height / 2 + 4}
			text-anchor="end"
			font-size="11"
			fill="currentColor"
			opacity="0.6"
		>
			{bar.point.label}
		</text>
	{/each}
</g>
