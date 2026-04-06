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
	<div bind:this={containerEl} class="chart-container">
		<svg
			viewBox="0 0 {width} {height}"
			role="img"
			{width}
			{height}
			aria-label="Chart"
			class="chart-svg"
			{...rest}
		>
			{@render children()}
		</svg>
	</div>
{:else}
	<svg viewBox="0 0 {width} {height}" role="img" {width} {height} aria-label="Chart" {...rest}>
		{@render children()}
	</svg>
{/if}

<style>
	.chart-container {
		width: 100%;
		height: 100%;
		min-height: 200px;
	}

	.chart-svg {
		width: 100%;
		height: 100%;
	}
</style>
