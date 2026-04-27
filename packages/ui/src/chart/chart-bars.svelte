<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import { getChartCtx, registerChartInteractive } from './context.svelte.js';

	interface Props extends Omit<SVGAttributes<SVGGElement>, 'onclick'> {
		radius?: number;
		onclick?: (event: { label: string; value: number; index: number }) => void;
	}

	let { radius = 2, onclick, class: className, ...rest }: Props = $props();

	const ctx = getChartCtx();
	ctx.hasBars = true;

	const chartWidth = $derived(ctx.width - ctx.padding.left - ctx.padding.right);
	const chartHeight = $derived(ctx.height - ctx.padding.top - ctx.padding.bottom);
	const valueRange = $derived(ctx.maxValue - ctx.minValue || 1);

	const bars = $derived(
		ctx.data.map((point, i) => {
			const barWidth = (chartWidth / ctx.data.length) * 0.7;
			const gap = (chartWidth / ctx.data.length) * 0.3;
			const x = ctx.padding.left + i * (barWidth + gap) + gap / 2;
			const barHeight = (point.value / valueRange) * chartHeight;
			const y = ctx.padding.top + chartHeight - barHeight;

			return { x, y, width: barWidth, height: Math.max(0, barHeight), point, index: i };
		})
	);

	function handleClick(bar: (typeof bars)[number]) {
		onclick?.({ label: bar.point.label, value: bar.point.value, index: bar.index });
	}

	const registeredHandler = $derived(
		onclick
			? (index: number) => {
					const point = ctx.data[index];
					if (!point) return;
					onclick({ label: point.label, value: point.value, index });
				}
			: undefined
	);

	registerChartInteractive(ctx, () => registeredHandler);
</script>

<g role="list" aria-label="Bar chart data" data-chart-bars class={className} {...rest}>
	{#each bars as bar (bar.index)}
		<rect
			x={bar.x}
			y={bar.y}
			width={bar.width}
			height={bar.height}
			rx={radius}
			fill={bar.point.color ?? 'currentColor'}
			data-part="bar"
			data-clickable={onclick ? '' : undefined}
			onclick={onclick ? () => handleClick(bar) : undefined}
		/>
	{/each}
</g>

<style>
	[data-chart-bars] {
		color: var(--dry-chart-bar-color);
	}
</style>
