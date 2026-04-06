<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SVGAttributes } from 'svelte/elements';
	import { setChartCtx, type ChartDataPoint } from './context.svelte.js';

	interface Props extends SVGAttributes<SVGSVGElement> {
		data: ChartDataPoint[];
		width?: number;
		height?: number;
		padding?: { top?: number; right?: number; bottom?: number; left?: number };
		children: Snippet;
	}

	let {
		data,
		width: widthProp,
		height: heightProp,
		padding: paddingProp,
		class: className,
		children,
		...rest
	}: Props = $props();

	let containerEl: HTMLDivElement | undefined = $state();
	let observedWidth = $state(400);
	let observedHeight = $state(300);

	const width = $derived(widthProp ?? observedWidth);
	const height = $derived(heightProp ?? observedHeight);

	$effect(() => {
		if (widthProp !== undefined && heightProp !== undefined) return;
		if (!containerEl) return;

		const ro = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const cr = entry.contentRect;
				if (widthProp === undefined) observedWidth = Math.round(cr.width) || 400;
				if (heightProp === undefined) observedHeight = Math.round(cr.height) || 300;
			}
		});

		ro.observe(containerEl);
		return () => ro.disconnect();
	});

	const padding = $derived({
		top: paddingProp?.top ?? 20,
		right: paddingProp?.right ?? 20,
		bottom: paddingProp?.bottom ?? 40,
		left: paddingProp?.left ?? 50
	});

	const minValue = $derived(Math.min(0, ...data.map((d) => d.value)));
	const maxValue = $derived(Math.max(...data.map((d) => d.value)));
	const total = $derived(data.reduce((sum, d) => sum + d.value, 0));

	setChartCtx({
		get data() {
			return data;
		},
		get width() {
			return width;
		},
		get height() {
			return height;
		},
		get minValue() {
			return minValue;
		},
		get maxValue() {
			return maxValue;
		},
		get total() {
			return total;
		},
		get padding() {
			return padding;
		},
		hasBars: false,
		hasHorizontalBars: false
	});
</script>

{#if widthProp === undefined || heightProp === undefined}
	<div bind:this={containerEl} data-chart-container>
		<svg
			viewBox="0 0 {width} {height}"
			role="img"
			{width}
			{height}
			aria-label="Chart"
			data-chart
			class={className}
			{...rest}
		>
			{@render children()}
		</svg>
	</div>
{:else}
	<svg
		viewBox="0 0 {width} {height}"
		role="img"
		{width}
		{height}
		aria-label="Chart"
		data-chart
		class={className}
		{...rest}
	>
		{@render children()}
	</svg>
{/if}

<style>
	[data-chart-container] {
		display: grid;
		min-height: 200px;
	}

	[data-chart] {
		--dry-chart-bg: var(--dry-color-bg-overlay);
		--dry-chart-border: var(--dry-color-stroke-weak);
		--dry-chart-radius: var(--dry-radius-xl);
		--dry-chart-axis-color: var(--dry-color-text-weak);
		--dry-chart-grid-color: color-mix(in srgb, var(--dry-color-stroke-weak) 65%, transparent);
		--dry-chart-bar-color: var(--dry-color-fill-brand);
		--dry-chart-line-color: var(--dry-color-fill-brand);

		display: block;
		height: auto;
		overflow: visible;
		border-radius: var(--dry-chart-radius);
		background: var(--dry-chart-bg);
		color: var(--dry-chart-axis-color);
		border: 1px solid var(--dry-chart-border);
	}
</style>
