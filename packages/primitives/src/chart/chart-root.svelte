<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SVGAttributes } from 'svelte/elements';
	import { setChartCtx, type ChartDataPoint } from './context.svelte.js';

	interface Props extends SVGAttributes<SVGSVGElement> {
		data: ChartDataPoint[];
		width?: number;
		height?: number;
		padding?: { top?: number; right?: number; bottom?: number; left?: number };
		summary?: string;
		children: Snippet;
	}

	let {
		data,
		width: widthProp,
		height: heightProp,
		padding: paddingProp,
		summary,
		'aria-label': ariaLabel = 'Chart',
		children,
		...rest
	}: Props = $props();

	const chartId = $props.id();

	let observedWidth = $state(400);
	let observedHeight = $state(300);
	let interactiveHandler: ((index: number) => void) | undefined = $state();
	let interactiveOwner: symbol | undefined = $state();

	const width = $derived(widthProp ?? observedWidth);
	const height = $derived(heightProp ?? observedHeight);

	function observeSize(node: HTMLDivElement) {
		const ro = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const cr = entry.contentRect;
				if (widthProp === undefined) observedWidth = Math.round(cr.width) || 400;
				if (heightProp === undefined) observedHeight = Math.round(cr.height) || 300;
			}
		});

		ro.observe(node);
		return () => ro.disconnect();
	}

	const padding = $derived({
		top: paddingProp?.top ?? 20,
		right: paddingProp?.right ?? 20,
		bottom: paddingProp?.bottom ?? 40,
		left: paddingProp?.left ?? 50
	});

	const stats = $derived.by(() => {
		let min = 0;
		let max = -Infinity;
		let total = 0;
		let highest: ChartDataPoint | undefined;
		let lowest: ChartDataPoint | undefined;
		for (const point of data) {
			const value = point.value;
			if (value < min) min = value;
			if (value > max) max = value;
			total += value;
			if (!highest || value > highest.value) highest = point;
			if (!lowest || value < lowest.value) lowest = point;
		}
		return { min, max, total, highest, lowest };
	});
	const minValue = $derived(stats.min);
	const maxValue = $derived(stats.max);
	const total = $derived(stats.total);
	const summaryText = $derived.by(() => {
		if (summary?.trim()) return summary;
		if (data.length === 0) return 'No data points available.';
		if (data.length === 1) return `${data[0]!.label}: ${data[0]!.value}.`;
		const { highest, lowest } = stats;
		if (!highest || !lowest) return `${data.length} data points available.`;
		return `${data.length} data points. Highest is ${highest.label} at ${highest.value}. Lowest is ${lowest.label} at ${lowest.value}. Total is ${stats.total}.`;
	});
	const isInteractive = $derived(Boolean(interactiveHandler));

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
		hasHorizontalBars: false,
		get interactiveHandler() {
			return interactiveHandler;
		},
		set interactiveHandler(handler) {
			interactiveHandler = handler;
		},
		get interactiveOwner() {
			return interactiveOwner;
		},
		set interactiveOwner(owner) {
			interactiveOwner = owner;
		}
	});
</script>

<div class="chart-root">
	<div class="chart-a11y" data-interactive={isInteractive || undefined}>
		<p id={`${chartId}-summary`} class="chart-summary">
			<strong>{ariaLabel}</strong>
			<span>{summaryText}</span>
		</p>
		<ul class="chart-data-list">
			{#each data as point, index (point.label)}
				<li>
					{#if interactiveHandler}
						<button type="button" onclick={() => interactiveHandler?.(index)}>
							{point.label}: {point.value}
						</button>
					{:else}
						<span>{point.label}: {point.value}</span>
					{/if}
				</li>
			{/each}
		</ul>
	</div>

	{#if widthProp === undefined || heightProp === undefined}
		<div class="chart-container" {@attach observeSize}>
			<svg
				viewBox="0 0 {width} {height}"
				{width}
				{height}
				class="chart-svg"
				{...rest}
				aria-hidden="true"
				focusable="false"
			>
				{@render children()}
			</svg>
		</div>
	{:else}
		<svg
			viewBox="0 0 {width} {height}"
			{width}
			{height}
			{...rest}
			aria-hidden="true"
			focusable="false"
		>
			{@render children()}
		</svg>
	{/if}
</div>

<style>
	.chart-root {
		display: grid;
	}

	.chart-a11y {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		clip-path: inset(50%);
		border: 0;
		white-space: nowrap;
	}

	.chart-a11y[data-interactive]:focus-within {
		position: static;
		width: auto;
		height: auto;
		margin: 0 0 0.75rem;
		overflow: visible;
		clip: auto;
		clip-path: none;
		white-space: normal;
	}

	.chart-summary {
		margin: 0;
	}

	.chart-summary strong {
		margin-inline-end: 0.25rem;
	}

	.chart-data-list {
		margin: 0.5rem 0 0;
		padding-inline-start: 1.25rem;
	}

	.chart-data-list button {
		font: inherit;
	}

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
