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
		showDots = true,
		dotRadius = 3,
		color = 'currentColor',
		class: className,
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

	const pathD = $derived(points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' '));
</script>

<g role="list" aria-label="Line chart data" data-chart-line class={className} {...rest}>
	<path
		d={pathD}
		fill="none"
		stroke={color}
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
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

<style>
	[data-chart-line] {
		color: var(--dry-chart-line-color);
	}
</style>
