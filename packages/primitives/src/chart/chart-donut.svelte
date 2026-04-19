<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SVGAttributes } from 'svelte/elements';
	import { getChartCtx, registerChartInteractive } from './context.svelte.js';

	interface Props extends Omit<SVGAttributes<SVGGElement>, 'onclick'> {
		innerRadius?: number;
		outerRadius?: number;
		label?: Snippet<[{ total: number }]>;
		onclick?: (event: { label: string; value: number; index: number }) => void;
	}

	let { innerRadius = 60, outerRadius = 80, label, onclick, ...rest }: Props = $props();

	const ctx = getChartCtx();

	const cx = $derived(ctx.width / 2);
	const cy = $derived(ctx.height / 2);
	const radius = $derived((innerRadius + outerRadius) / 2);
	const strokeW = $derived(outerRadius - innerRadius);
	const circumference = $derived(2 * Math.PI * radius);

	const segments = $derived(
		(() => {
			const total = ctx.total || 1;
			let cumulative = 0;
			return ctx.data.map((point, i) => {
				const fraction = point.value / total;
				const dashLength = fraction * circumference;
				const offset = -(cumulative / total) * circumference;
				cumulative += point.value;
				return {
					dasharray: `${dashLength} ${circumference - dashLength}`,
					dashoffset: offset,
					color: point.color ?? 'currentColor',
					point,
					index: i
				};
			});
		})()
	);

	function handleClick(seg: (typeof segments)[number]) {
		onclick?.({ label: seg.point.label, value: seg.point.value, index: seg.index });
	}

	function attachSegmentClick(seg: (typeof segments)[number]) {
		if (!onclick) return undefined;

		return (node: SVGCircleElement) => {
			const handleNodeClick = () => handleClick(seg);
			node.addEventListener('click', handleNodeClick);
			return () => node.removeEventListener('click', handleNodeClick);
		};
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

<g role="list" aria-label="Donut chart data" {...rest}>
	{#each segments as seg (seg.index)}
		<circle
			{cx}
			{cy}
			r={radius}
			fill="none"
			stroke={seg.color}
			stroke-width={strokeW}
			stroke-dasharray={seg.dasharray}
			stroke-dashoffset={seg.dashoffset}
			transform="rotate(-90 {cx} {cy})"
			data-part="donut-segment"
			data-clickable={onclick ? '' : undefined}
			{@attach attachSegmentClick(seg)}
		/>
	{/each}
	{#if label}
		<foreignObject
			x={cx - innerRadius}
			y={cy - innerRadius}
			width={innerRadius * 2}
			height={innerRadius * 2}
		>
			<div class="donut-label-wrapper" data-part="donut-label">
				{@render label({ total: ctx.total })}
			</div>
		</foreignObject>
	{/if}
</g>

<style>
	.donut-label-wrapper {
		display: grid;
		place-items: center;
		block-size: 100%;
	}
</style>
