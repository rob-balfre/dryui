<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import { getChartCtx } from './context.svelte.js';

	interface Props extends SVGAttributes<SVGGElement> {}

	let { class: className, ...rest }: Props = $props();

	const ctx = getChartCtx();

	const chartWidth = $derived(ctx.width - ctx.padding.left - ctx.padding.right);
	const chartHeight = $derived(ctx.height - ctx.padding.top - ctx.padding.bottom);
	const y = $derived(ctx.padding.top + chartHeight);

	const labels = $derived(
		ctx.data.map((point, i) => {
			let x: number;
			if (ctx.hasBars) {
				const barWidth = (chartWidth / ctx.data.length) * 0.7;
				const gap = (chartWidth / ctx.data.length) * 0.3;
				x = ctx.padding.left + i * (barWidth + gap) + gap / 2 + barWidth / 2;
			} else {
				x = ctx.padding.left + (i / Math.max(ctx.data.length - 1, 1)) * chartWidth;
			}
			return { x, label: point.label };
		})
	);
</script>

<g aria-hidden="true" data-chart-axis class={className} {...rest}>
	<line
		x1={ctx.padding.left}
		y1={y}
		x2={ctx.padding.left + chartWidth}
		y2={y}
		stroke="currentColor"
		stroke-opacity="0.2"
	/>
	{#each labels as l}
		<text x={l.x} y={y + 16} text-anchor="middle" font-size="11" fill="currentColor" opacity="0.6">
			{l.label}
		</text>
	{/each}
</g>

<style>
	[data-chart-axis] {
		color: var(--dry-chart-axis-color);
	}
</style>
