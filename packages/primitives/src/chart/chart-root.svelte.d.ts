import type { Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import { type ChartDataPoint } from './context.svelte.js';
interface Props extends SVGAttributes<SVGSVGElement> {
	data: ChartDataPoint[];
	width?: number;
	height?: number;
	padding?: {
		top?: number;
		right?: number;
		bottom?: number;
		left?: number;
	};
	children: Snippet;
}
declare const ChartRoot: import('svelte').Component<Props, {}, ''>;
type ChartRoot = ReturnType<typeof ChartRoot>;
export default ChartRoot;
