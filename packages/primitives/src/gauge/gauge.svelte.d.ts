import type { Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
interface Props extends SVGAttributes<SVGSVGElement> {
	value: number;
	min?: number;
	max?: number;
	startAngle?: number;
	endAngle?: number;
	thresholds?: {
		value: number;
		color: string;
	}[];
	label?: Snippet<
		[
			{
				value: number;
				percentage: number;
			}
		]
	>;
	children?: Snippet;
}
declare const Gauge: import('svelte').Component<Props, {}, ''>;
type Gauge = ReturnType<typeof Gauge>;
export default Gauge;
