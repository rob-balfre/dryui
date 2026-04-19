import { createContext } from '../utils/create-context.js';

export interface ChartDataPoint {
	label: string;
	value: number;
	color?: string;
}

export interface ChartStackedDataPoint {
	label: string;
	segments: { value: number; color: string }[];
}

export interface ChartContext {
	readonly data: ChartDataPoint[];
	readonly width: number;
	readonly height: number;
	readonly minValue: number;
	readonly maxValue: number;
	readonly total: number;
	readonly padding: { top: number; right: number; bottom: number; left: number };
	hasBars: boolean;
	hasHorizontalBars: boolean;
	interactiveHandler?: (index: number) => void;
	interactiveOwner?: symbol;
}
export const [setChartCtx, getChartCtx] = createContext<ChartContext>('chart');

/**
 * Register a chart child as the current interactive-click owner. The child
 * passes a `getHandler` thunk that returns its reactive handler (or undefined
 * when no click callback is set). Cleanup only clears the owner if this child
 * still owns it, so overlapping children (e.g. bars + line) don't stomp each
 * other during teardown.
 */
export function registerChartInteractive(
	ctx: ChartContext,
	getHandler: () => ((index: number) => void) | undefined
): void {
	const owner = Symbol('chart-interactive');
	$effect(() => {
		ctx.interactiveOwner = owner;
		ctx.interactiveHandler = getHandler();
		return () => {
			if (ctx.interactiveOwner === owner) {
				ctx.interactiveHandler = undefined;
				ctx.interactiveOwner = undefined;
			}
		};
	});
}
