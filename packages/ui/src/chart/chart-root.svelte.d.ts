import type { Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
interface Props extends SVGAttributes<SVGSVGElement> {
	data: import('@dryui/primitives').ChartDataPoint[];
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
