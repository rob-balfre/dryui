export interface ChartDataPoint {
	label: string;
	value: number;
	color?: string;
}
export interface ChartStackedDataPoint {
	label: string;
	segments: {
		value: number;
		color: string;
	}[];
}
interface ChartContext {
	readonly data: ChartDataPoint[];
	readonly width: number;
	readonly height: number;
	readonly minValue: number;
	readonly maxValue: number;
	readonly total: number;
	readonly padding: {
		top: number;
		right: number;
		bottom: number;
		left: number;
	};
	hasBars: boolean;
	hasHorizontalBars: boolean;
}
export declare const setChartCtx: (ctx: ChartContext) => ChartContext,
	getChartCtx: () => ChartContext;
export {};
