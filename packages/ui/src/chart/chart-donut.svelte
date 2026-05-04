<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SVGAttributes } from 'svelte/elements';
	import { getChartCtx, registerChartInteractive } from './context.svelte.js';
	import { chartSeriesColor } from './series-color.js';

	interface Props extends Omit<SVGAttributes<SVGGElement>, 'onclick'> {
		innerRadius?: number;
		outerRadius?: number;
		label?: Snippet<[{ total: number }]>;
		onclick?: (event: { label: string; value: number; index: number }) => void;
	}

	let {
		innerRadius = 60,
		outerRadius = 80,
		label,
		onclick,
		class: className,
		...rest
	}: Props = $props();

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
					color: point.color ?? chartSeriesColor(i),
					point,
					index: i
				};
			});
		})()
	);

	function handleClick(seg: (typeof segments)[number]) {
		onclick?.({ label: seg.point.label, value: seg.point.value, index: seg.index });
	}

	function handleKeydown(event: KeyboardEvent, seg: (typeof segments)[number]) {
		if (!onclick || (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar')) {
			return;
		}

		event.preventDefault();
		handleClick(seg);
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

<g
	role={onclick ? 'group' : 'list'}
	aria-label="Donut chart data"
	data-chart-donut
	class={className}
	{...rest}
>
	{#each segments as seg (seg.index)}
		{#if onclick}
			<circle
				role="button"
				tabindex={0}
				aria-label={`${seg.point.label}: ${seg.point.value}`}
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
				data-clickable=""
				onclick={() => handleClick(seg)}
				onkeydown={(event) => handleKeydown(event, seg)}
			/>
		{:else}
			<circle
				role="listitem"
				aria-label={`${seg.point.label}: ${seg.point.value}`}
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
			/>
		{/if}
	{/each}
	{#if label}
		<foreignObject
			x={cx - innerRadius}
			y={cy - innerRadius}
			width={innerRadius * 2}
			height={innerRadius * 2}
		>
			<div data-chart-donut-label data-part="donut-label">
				{@render label({ total: ctx.total })}
			</div>
		</foreignObject>
	{/if}
</g>

<style>
	[data-chart-donut] {
		color: var(--dry-chart-bar-color);
	}

	[data-chart-donut-label] {
		display: grid;
		place-items: center;
		height: 100%;
	}
</style>
