<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import { getChartCtx } from './context.svelte.js';

	interface Props extends SVGAttributes<SVGGElement> {
		ticks?: number;
	}

	let { ticks = 5, ...rest }: Props = $props();

	const ctx = getChartCtx();

	const chartHeight = $derived(ctx.height - ctx.padding.top - ctx.padding.bottom);
	const valueRange = $derived(ctx.maxValue - ctx.minValue || 1);

	const tickValues = $derived(
		Array.from({ length: ticks }, (_, i) => {
			const fraction = i / (ticks - 1);
			return ctx.minValue + fraction * valueRange;
		})
	);

	const tickPositions = $derived(
		tickValues.map((value) => {
			const y = ctx.padding.top + chartHeight - ((value - ctx.minValue) / valueRange) * chartHeight;
			return { y, value };
		})
	);
</script>

<g aria-hidden="true" {...rest}>
	<line
		x1={ctx.padding.left}
		y1={ctx.padding.top}
		x2={ctx.padding.left}
		y2={ctx.padding.top + chartHeight}
		stroke="currentColor"
		stroke-opacity="0.2"
	/>
	{#each tickPositions as tick}
		<text
			x={ctx.padding.left - 8}
			y={tick.y + 4}
			text-anchor="end"
			font-size="11"
			fill="currentColor"
			opacity="0.6"
		>
			{Math.round(tick.value)}
		</text>
		<line
			x1={ctx.padding.left}
			y1={tick.y}
			x2={ctx.width - ctx.padding.right}
			y2={tick.y}
			stroke="currentColor"
			stroke-opacity="0.08"
		/>
	{/each}
</g>
