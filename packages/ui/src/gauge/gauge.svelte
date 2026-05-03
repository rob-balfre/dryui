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
		class: className,
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
			if (thresholdColor) node.style.setProperty('--_gauge-fill-stroke', thresholdColor);
			else node.style.removeProperty('--_gauge-fill-stroke');
		});
	}
</script>

<svg
	class={className}
	data-gauge
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
			<div data-gauge-label>
				{@render label({ value, percentage })}
			</div>
		</foreignObject>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</svg>

<style>
	[data-gauge] {
		/* Component tokens (Tier 3) */
		--dry-gauge-size: 8rem;
		--dry-gauge-track-color: var(--dry-color-stroke-weak);
		--dry-gauge-fill-color: var(--dry-color-fill-brand);
		--dry-gauge-stroke-width: 8;

		/* Threshold zone palette. Consumers can override any slot to retheme
		   the arc segmentation. Default order: brand, success, warning, error. */
		--dry-gauge-zone-1: var(--dry-color-fill-brand);
		--dry-gauge-zone-2: var(--dry-color-fill-success);
		--dry-gauge-zone-3: var(--dry-color-fill-warning);
		--dry-gauge-zone-4: var(--dry-color-fill-error);

		aspect-ratio: 1;
		height: var(--dry-gauge-size);
	}

	[data-gauge] [data-part='track'] {
		fill: none;
		stroke: var(--dry-gauge-track-color);
		stroke-width: var(--dry-gauge-stroke-width);
		stroke-linecap: round;
		opacity: 1;
	}

	[data-gauge] [data-part='fill'] {
		fill: none;
		stroke: var(--_gauge-fill-stroke, var(--dry-gauge-fill-color));
		stroke-width: var(--dry-gauge-stroke-width);
		stroke-linecap: round;
		transition: d var(--dry-duration-normal) var(--dry-ease-default);
	}

	[data-gauge-label] {
		display: grid;
		place-items: center;
		height: 100%;
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		[data-gauge] [data-part='fill'] {
			transition: none;
		}
	}
</style>
