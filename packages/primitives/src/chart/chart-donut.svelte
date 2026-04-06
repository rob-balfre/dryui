<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SVGAttributes } from 'svelte/elements';
	import { getChartCtx } from './context.svelte.js';

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
</script>

<g role="list" aria-label="Donut chart data" {...rest}>
	{#each segments as seg}
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
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
			role={onclick ? 'button' : 'listitem'}
			tabindex={onclick ? 0 : undefined}
			aria-label="{seg.point.label}: {seg.point.value}"
			data-part="donut-segment"
			data-clickable={onclick ? '' : undefined}
			onclick={onclick ? () => handleClick(seg) : undefined}
			onkeydown={onclick
				? (e: KeyboardEvent) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							handleClick(seg);
						}
					}
				: undefined}
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
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}
</style>
