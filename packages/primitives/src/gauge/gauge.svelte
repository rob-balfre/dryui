<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SVGAttributes } from 'svelte/elements';

	interface Props extends SVGAttributes<SVGSVGElement> {
		value: number;
		min?: number;
		max?: number;
		startAngle?: number;
		endAngle?: number;
		thresholds?: { value: number; color: string }[];
		label?: Snippet<[{ value: number; percentage: number }]>;
		children?: Snippet;
	}

	let {
		value,
		min = 0,
		max = 100,
		startAngle = -135,
		endAngle = 135,
		thresholds,
		label,
		children,
		...rest
	}: Props = $props();

	function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
		const angleRad = ((angleDeg - 90) * Math.PI) / 180;
		return { x: cx + radius * Math.cos(angleRad), y: cy + radius * Math.sin(angleRad) };
	}

	function describeArc(cx: number, cy: number, radius: number, start: number, end: number): string {
		const s = polarToCartesian(cx, cy, radius, end);
		const e = polarToCartesian(cx, cy, radius, start);
		const largeArcFlag = end - start <= 180 ? 0 : 1;
		return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${e.x} ${e.y}`;
	}

	const percentage = $derived(
		max > min ? Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100) : 0
	);

	const fillAngle = $derived(startAngle + ((endAngle - startAngle) * percentage) / 100);

	const trackPath = $derived(describeArc(50, 50, 40, startAngle, endAngle));
	const fillPath = $derived(percentage > 0 ? describeArc(50, 50, 40, startAngle, fillAngle) : '');

	const thresholdColor = $derived.by(() => {
		if (!thresholds || thresholds.length === 0) return undefined;
		const sorted = [...thresholds].sort((a, b) => a.value - b.value);
		let color: string | undefined;
		for (const t of sorted) {
			if (value >= t.value) {
				color = t.color;
			}
		}
		return color;
	});

	function applyFillStroke(node: SVGElement) {
		$effect(() => {
			if (thresholdColor) node.style.setProperty('stroke', thresholdColor);
			else node.style.removeProperty('stroke');
		});
	}
</script>

<svg
	role="meter"
	aria-valuenow={value}
	aria-valuemin={min}
	aria-valuemax={max}
	viewBox="0 0 100 100"
	{...rest}
>
	<path data-part="track" d={trackPath} fill="none" stroke="currentColor" opacity="0.2" />
	{#if fillPath}
		<path data-part="fill" d={fillPath} fill="none" stroke="currentColor" use:applyFillStroke />
	{/if}
	{#if label}
		<foreignObject x="10" y="10" width="80" height="80">
			<div class="gauge-label-wrapper">
				{@render label({ value, percentage })}
			</div>
		</foreignObject>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</svg>

<style>
	.gauge-label-wrapper {
		display: grid;
		place-items: center;
		block-size: 100%;
	}
</style>
