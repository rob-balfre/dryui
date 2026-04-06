<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import { getChartCtx } from './context.svelte.js';

	interface Props extends Omit<SVGAttributes<SVGGElement>, 'onclick'> {
		radius?: number;
		onclick?: (event: { label: string; value: number; index: number }) => void;
	}

	let { radius = 2, onclick, ...rest }: Props = $props();

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
</script>

<g role="list" aria-label="Bar chart data" {...rest}>
	{#each bars as bar}
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<rect
			x={bar.x}
			y={bar.y}
			width={bar.width}
			height={bar.height}
			rx={radius}
			fill={bar.point.color ?? 'currentColor'}
			role={onclick ? 'button' : 'listitem'}
			tabindex={onclick ? 0 : undefined}
			aria-label="{bar.point.label}: {bar.point.value}"
			data-part="bar"
			data-clickable={onclick ? '' : undefined}
			onclick={onclick ? () => handleClick(bar) : undefined}
			onkeydown={onclick
				? (e: KeyboardEvent) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							handleClick(bar);
						}
					}
				: undefined}
		/>
	{/each}
</g>
