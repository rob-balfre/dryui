import type { Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';

export type { ChartDataPoint, ChartStackedDataPoint } from './context.svelte.js';

export interface ChartRootProps extends SVGAttributes<SVGSVGElement> {
	data: import('./context.svelte.js').ChartDataPoint[];
	width?: number;
	height?: number;
	padding?: { top?: number; right?: number; bottom?: number; left?: number };
	children: Snippet;
}

export interface ChartBarsProps extends Omit<SVGAttributes<SVGGElement>, 'onclick'> {
	radius?: number;
	onclick?: (event: { label: string; value: number; index: number }) => void;
}

export interface ChartLineProps extends SVGAttributes<SVGGElement> {
	strokeWidth?: number;
	showDots?: boolean;
	dotRadius?: number;
	color?: string;
}

export interface ChartAreaProps extends SVGAttributes<SVGGElement> {
	strokeWidth?: number;
	showDots?: boolean;
	dotRadius?: number;
	color?: string;
}

export interface ChartDonutProps extends Omit<SVGAttributes<SVGGElement>, 'onclick'> {
	innerRadius?: number;
	outerRadius?: number;
	label?: Snippet<[{ total: number }]>;
	onclick?: (event: { label: string; value: number; index: number }) => void;
}

export interface ChartStackedBarProps extends SVGAttributes<SVGGElement> {
	stackedData: import('./context.svelte.js').ChartStackedDataPoint[];
	radius?: number;
}

export interface ChartHorizontalBarProps extends SVGAttributes<SVGGElement> {
	radius?: number;
}

export interface ChartXAxisProps extends SVGAttributes<SVGGElement> {}

export interface ChartYAxisProps extends SVGAttributes<SVGGElement> {
	ticks?: number;
}

import ChartRoot from './chart-root.svelte';
import ChartBars from './chart-bars.svelte';
import ChartLine from './chart-line.svelte';
import ChartArea from './chart-area.svelte';
import ChartDonut from './chart-donut.svelte';
import ChartStackedBar from './chart-stacked-bar.svelte';
import ChartHorizontalBar from './chart-horizontal-bar.svelte';
import ChartXAxis from './chart-x-axis.svelte';
import ChartYAxis from './chart-y-axis.svelte';

export const Chart: {
	Root: typeof ChartRoot;
	Bars: typeof ChartBars;
	Line: typeof ChartLine;
	Area: typeof ChartArea;
	Donut: typeof ChartDonut;
	StackedBar: typeof ChartStackedBar;
	HorizontalBar: typeof ChartHorizontalBar;
	XAxis: typeof ChartXAxis;
	YAxis: typeof ChartYAxis;
} = {
	Root: ChartRoot,
	Bars: ChartBars,
	Line: ChartLine,
	Area: ChartArea,
	Donut: ChartDonut,
	StackedBar: ChartStackedBar,
	HorizontalBar: ChartHorizontalBar,
	XAxis: ChartXAxis,
	YAxis: ChartYAxis
};
